import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CreatePropertyDto,
  I_PROPERTY_REPOSITORY,
  IPropertyRepository,
  PermissionAwareUser,
  PropertyDto,
  PropertyLifecycleAction,
  PropertyLifecycleEvent,
  PropertyStatus,
  UpdatePropertyDto,
  I_UNIT_REPOSITORY,
  IUnitRepository,
  UnitStatus,
} from '@app/common-types';
import { PubSubClient } from '@app/pubsub-sdk';

type DuplicateCheckPayload = {
  property?: Partial<PropertyDto>;
  [key: string]: unknown;
};

interface DuplicateCheckRequest {
  propertyId?: string;
  payload?: DuplicateCheckPayload;
}

const ACTION_PERMISSION_MAP: Record<PropertyLifecycleAction, string> = {
  create_property: 'property:create',
  logical_delete_property: 'property:delete:logical',
  hard_delete_property: 'property:delete:hard',
};

@Injectable()
export class PropertyAiService {
  private readonly logger = new Logger(PropertyAiService.name);
  private readonly blockingUnitStatusesForDeletion = [
    UnitStatus.OCCUPIED,
    UnitStatus.UNDER_MAINTENANCE,
  ];
  private readonly lifecycleSubscriptionName: string =
    process.env.PROPERTY_EVENTS_SUBSCRIPTION ?? 'property-events';

  constructor(
    @Inject(I_PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(I_UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    private readonly pubSubClient: PubSubClient,
  ) {}

  getHello(): string {
    return 'Hello from Property AI Ministry!';
  }

  async createProperty(createPropertyDto: CreatePropertyDto): Promise<PropertyDto> {
    this.logger.log(`Attempting to create property: ${JSON.stringify(createPropertyDto)}`);
    const createdProperty = await this.propertyRepository.create(createPropertyDto);
    this.logger.log(`Property created successfully with ID: ${createdProperty.id}`);
    this.emitLifecycleEvent('create_property', createdProperty);
    return createdProperty;
  }

  async findPropertyById(id: string): Promise<PropertyDto | null> {
    this.logger.log(`Attempting to find property with ID: ${id}`);
    const property = await this.propertyRepository.findById(id);
    if (property) {
      this.logger.log(`Found property with ID: ${id}`);
    } else {
      this.logger.warn(`Property with ID: ${id} not found.`);
    }
    return property;
  }

  async findAllProperties(): Promise<PropertyDto[]> {
    this.logger.log('Attempting to find all properties.');
    const properties = await this.propertyRepository.findAll();
    this.logger.log(`Found ${properties.length} properties.`);
    return properties;
  }

  async findPropertyByName(name: string): Promise<PropertyDto[]> {
    this.logger.log(`Attempting to find properties by name: "${name}"`);
    const properties = await this.propertyRepository.findByName(name);
    if (properties.length > 0) {
      this.logger.log(`Found ${properties.length} properties with name: "${name}"`);
    } else {
      this.logger.warn(`No properties found with name: "${name}"`);
    }
    return properties;
  }

  async updateProperty(id: string, updatePropertyDto: UpdatePropertyDto): Promise<PropertyDto> {
    const property = await this.ensurePropertyExists(id);
    this.logger.log(`Attempting to update property with ID: ${id}`);
    const sanitizedUpdate: Partial<PropertyDto> = { ...updatePropertyDto };
    delete sanitizedUpdate.ownerId;

    const updatedProperty = await this.propertyRepository.update(id, sanitizedUpdate);
    this.logger.log(`Property with ID: ${id} updated successfully.`);
    return updatedProperty;
  }

  async logicalDeleteProperty(id: string): Promise<void> {
    const property = await this.ensurePropertyExists(id);
    if (property.status === PropertyStatus.LOGICALLY_DELETED) {
      this.logger.log(`Property with ID: ${id} is already logically deleted.`);
      return;
    }
    await this.runPropertyDeleteChecks(id);
    await this.propertyRepository.logicalDelete(id);
    this.logger.log(`Property with ID: ${id} logically deleted.`);
    const updatedProperty = await this.propertyRepository.findById(id);
    if (updatedProperty) {
      this.emitLifecycleEvent('logical_delete_property', updatedProperty, {
        note: 'Property flagged as logically deleted',
      });
    } else {
      this.logger.warn(`Property ${id} disappeared after logical delete; skipping lifecycle event.`);
    }
  }

  async hardDeleteProperty(id: string): Promise<void> {
    const property = await this.ensurePropertyExists(id);
    await this.runPropertyDeleteChecks(id);
    await this.deletePropertyUnits(id);
    await this.propertyRepository.delete(id);
    this.logger.log(`Property with ID: ${id} hard deleted.`);
    this.emitLifecycleEvent('hard_delete_property', property, {
      note: 'Property removed from system',
    });
  }

  private async ensurePropertyExists(id: string): Promise<PropertyDto> {
    const property = await this.propertyRepository.findById(id);
    if (!property) {
      this.logger.warn(`Property with ID: ${id} does not exist.`);
      throw new NotFoundException(`Property "${id}" not found`);
    }
    return property;
  }

  private async runPropertyDeleteChecks(propertyId: string): Promise<void> {
    const units = await this.unitRepository.findByPropertyId(propertyId);
    const problematicUnits = units.filter((unit) =>
      this.blockingUnitStatusesForDeletion.includes(unit.status),
    );

    if (problematicUnits.length > 0) {
      this.logger.warn(
        `Property ${propertyId} has ${problematicUnits.length} units with blocking statuses.`,
      );
      throw new BadRequestException(
        'Cannot delete property while there are units occupied or under maintenance.',
      );
    }

    const tenantsCleared = await this.ensureNoActiveTenants(propertyId);
    const balanceCleared = await this.ensureNoOutstandingBalance(propertyId);

    if (!tenantsCleared || !balanceCleared) {
      throw new BadRequestException('Property cannot be deleted until all checks pass.');
    }
  }

  private async deletePropertyUnits(propertyId: string): Promise<void> {
    const units = await this.unitRepository.findByPropertyId(propertyId);
    if (units.length === 0) {
      return;
    }
    await Promise.all(units.map((unit) => this.unitRepository.delete(unit.id)));
  }

  private buildLifecycleUser(action: PropertyLifecycleAction): PermissionAwareUser {
    return {
      id: 'property-ai-system',
      role: 'property-ai',
      permissions: [ACTION_PERMISSION_MAP[action]],
    };
  }

  private emitLifecycleEvent(
    action: PropertyLifecycleAction,
    property: PropertyDto,
    extraPayload: Record<string, unknown> = {},
  ): void {
    if (!this.lifecycleSubscriptionName) {
      this.logger.warn('Property lifecycle subscription is not configured; skipping event.');
      return;
    }

    const event: PropertyLifecycleEvent = {
      eventId: `evt-${randomUUID()}`,
      action,
      propertyId: property.id,
      user: this.buildLifecycleUser(action),
      payload: {
        property,
        ...extraPayload,
      },
      timestamp: new Date().toISOString(),
    };

    this.pubSubClient.publish(this.lifecycleSubscriptionName, event);
    this.logger.log(`Published lifecycle event ${event.eventId} for action ${action}`);
  }

  async duplicateCheck(request: DuplicateCheckRequest): Promise<{ cleared: boolean; details: string }> {
    const candidateName = request.payload?.property?.name?.trim();
    if (!candidateName) {
      const details = 'Duplicate check did not receive a property name; assuming unique.';
      this.logger.warn(details);
      return { cleared: true, details };
    }

    const matches = await this.propertyRepository.findByName(candidateName);
    const duplicates = matches.filter((match) => match.id !== request.propertyId);

    if (duplicates.length > 0) {
      const details = `Property name "${candidateName}" already exists (${duplicates[0].id}).`;
      this.logger.warn(details);
      return { cleared: false, details };
    }

    const details = `Property name "${candidateName}" is unique.`;
    this.logger.log(details);
    return { cleared: true, details };
  }

  private async ensureNoActiveTenants(propertyId: string): Promise<boolean> {
    this.logger.debug(`Checking tenant constraints for property ${propertyId}.`);
    // TODO: Integrate tenant/transaction system once available.
    return true;
  }

  private async ensureNoOutstandingBalance(propertyId: string): Promise<boolean> {
    this.logger.debug(`Checking outstanding balances for property ${propertyId}.`);
    // TODO: Wire in Finance AI ledger once available.
    return true;
  }
}

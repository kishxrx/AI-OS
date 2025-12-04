import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUnitDto,
  I_UNIT_REPOSITORY,
  IUnitRepository,
  UpdateUnitDto,
  UnitDto,
  UnitStatus,
  I_PROPERTY_REPOSITORY,
  IPropertyRepository,
} from '@app/common-types';

@Injectable()
export class UnitAiService {
  private readonly logger = new Logger(UnitAiService.name);
  private readonly hardDeleteBlockedStatuses = [UnitStatus.OCCUPIED];

  constructor(
    @Inject(I_UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    @Inject(I_PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async createUnit(propertyId: string, createUnitDto: CreateUnitDto): Promise<UnitDto> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      this.logger.warn(`Property ${propertyId} not found when creating unit.`);
      throw new NotFoundException(`Property "${propertyId}" not found`);
    }

    const requestPayload: CreateUnitDto = {
      ...createUnitDto,
      propertyId,
    };

    const createdUnit = await this.unitRepository.create(requestPayload);
    this.logger.log(`Unit created successfully with ID: ${createdUnit.id}`);
    return createdUnit;
  }

  async findUnitsByProperty(propertyId: string): Promise<UnitDto[]> {
    await this.ensurePropertyExists(propertyId);
    const units = await this.unitRepository.findByPropertyId(propertyId);
    this.logger.log(`Found ${units.length} units for property ${propertyId}.`);
    return units;
  }

  async findUnitById(id: string): Promise<UnitDto | null> {
    this.logger.log(`Attempting to find unit with ID: ${id}`);
    const unit = await this.unitRepository.findById(id);
    if (unit) {
      this.logger.log(`Found unit with ID: ${id}`);
    } else {
      this.logger.warn(`Unit with ID: ${id} not found.`);
    }
    return unit;
  }

  async findAllUnits(): Promise<UnitDto[]> {
    this.logger.log('Attempting to find all units.');
    const units = await this.unitRepository.findAll();
    this.logger.log(`Found ${units.length} units.`);
    return units;
  }

  async updateUnit(id: string, updateUnitDto: UpdateUnitDto): Promise<UnitDto> {
    const unit = await this.getUnitOrThrow(id);
    this.logger.log(`Attempting to update unit with ID: ${id}`);
    const sanitizedUpdate: Partial<UnitDto> = { ...updateUnitDto };
    delete sanitizedUpdate.propertyId;

    const updatedUnit = await this.unitRepository.update(id, sanitizedUpdate);
    this.logger.log(`Unit with ID: ${id} updated successfully.`);
    return updatedUnit;
  }

  async deleteUnit(id: string): Promise<void> {
    const unit = await this.getUnitOrThrow(id);
    if (this.hardDeleteBlockedStatuses.includes(unit.status)) {
      this.logger.warn(`Unit ${id} currently in status ${unit.status}; cannot hard delete.`);
      throw new BadRequestException('Unit cannot be hard deleted while it is occupied.');
    }
    await this.unitRepository.delete(id);
    this.logger.log(`Unit with ID: ${id} hard deleted.`);
  }

  async logicalDeleteUnit(id: string): Promise<void> {
    const unit = await this.getUnitOrThrow(id);
    if (unit.status === UnitStatus.UNDER_MAINTENANCE) {
      this.logger.log(`Unit ${id} is already under maintenance.`);
      return;
    }
    if (unit.status === UnitStatus.OCCUPIED) {
      this.logger.warn(`Unit ${id} is occupied and cannot be marked under maintenance.`);
      throw new BadRequestException('Occupied units cannot be logically deleted.');
    }
    await this.unitRepository.logicalDelete(id);
    this.logger.log(`Unit with ID: ${id} marked as under maintenance.`);
  }

  private async ensurePropertyExists(propertyId: string): Promise<void> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      this.logger.warn(`Property ${propertyId} not found during unit lookup.`);
      throw new NotFoundException(`Property "${propertyId}" not found`);
    }
  }

  private async getUnitOrThrow(id: string): Promise<UnitDto> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      this.logger.warn(`Unit with ID ${id} not found.`);
      throw new NotFoundException(`Unit "${id}" not found`);
    }
    return unit;
  }
}

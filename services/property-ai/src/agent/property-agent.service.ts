import { Injectable, Logger } from '@nestjs/common';
import { PropertyAiService } from '../property-ai.service';
import {
  CreatePropertyDto,
  PropertyDto,
  PropertyStatus,
  UpdatePropertyDto,
} from '@app/common-types';

export type PropertyAgentAction =
  | 'create'
  | 'update'
  | 'logicalDelete'
  | 'hardDelete'
  | 'summary'
  | 'priority'
  | 'occupancy';

export interface PropertyAgentRequest {
  action: PropertyAgentAction;
  propertyId?: string;
  payload?: Partial<CreatePropertyDto> &
    Partial<UpdatePropertyDto> & {
      confirmHardDelete?: boolean;
    };
}

export interface PropertyAgentResponse {
  narrative: string;
  success: boolean;
  data?: PropertyDto | PropertyDto[] | null;
  recommendations?: string[];
  safety?: string;
}

@Injectable()
export class PropertyAgentService {
  private readonly logger = new Logger(PropertyAgentService.name);

  constructor(private readonly propertyService: PropertyAiService) {}

  async handleCommand(request: PropertyAgentRequest): Promise<PropertyAgentResponse> {
    switch (request.action) {
      case 'create':
        return this.handleCreate(request.payload);
      case 'update':
        return this.handleUpdate(request.propertyId, request.payload);
      case 'logicalDelete':
        return this.handleLogicalDelete(request.propertyId);
      case 'hardDelete':
        return this.handleHardDelete(request.propertyId, request.payload?.confirmHardDelete);
      case 'summary':
        return this.handleSummary();
      case 'priority':
        return this.handlePriority();
      case 'occupancy':
        return this.handleOccupancy();
      default:
        return {
          narrative: 'Unknown property action requested.',
          success: false,
        };
    }
  }

  private async handleCreate(payload?: Partial<CreatePropertyDto>): Promise<PropertyAgentResponse> {
    if (!payload || !payload.name || !payload.type || !payload.address || !payload.ownerId) {
      return {
        narrative: 'Provide property details to create a new entry.',
        success: false,
      };
    }

    const created = await this.propertyService.createProperty(payload as CreatePropertyDto);
    return {
      narrative: `Property "${created.name}" was created with status ${created.status}. It is stored securely in Firestore with ID ${created.id}.`,
      success: true,
      data: created,
      safety: 'Data saved to Firestore immediately.',
      recommendations: [
        'Run duplicate-check if you plan to create sister properties.',
        'Assign units through the UI to match the property capacity.',
      ],
    };
  }

  private async handleUpdate(
    id: string | undefined,
    payload?: UpdatePropertyDto,
  ): Promise<PropertyAgentResponse> {
    if (!id || !payload) {
      return {
        narrative: 'Provide a property ID and updates to proceed.',
        success: false,
      };
    }

    const updated = await this.propertyService.updateProperty(id, payload);
    return {
      narrative: `Property "${updated.name}" (${updated.id}) was updated. The platform keeps the latest schema snapshot in Firestore.`,
      success: true,
      data: updated,
      safety: 'Updates are audited automatically in Firestore.',
    };
  }

  private async handleLogicalDelete(
    id: string | undefined,
  ): Promise<PropertyAgentResponse> {
    if (!id) {
      return {
        narrative: 'Send the property ID you want to logically delete.',
        success: false,
      };
    }

    await this.propertyService.logicalDeleteProperty(id);
    const property = await this.propertyService.findPropertyById(id);
    const name = property?.name ?? 'unknown property';
    return {
      narrative: `Property "${name}" (${id}) is now marked as logically deleted. The document remains in Firestore; data stays safe and can be reactivated later.`,
      success: true,
      data: property,
      safety: 'Only the status flag changes; no data is removed.',
      recommendations: ['Review units if you plan to reopen this property later.'],
    };
  }

  private async handleHardDelete(
    id: string | undefined,
    confirmed?: boolean,
  ): Promise<PropertyAgentResponse> {
    if (!id) {
      return {
        narrative: 'Please supply the property ID before hard deleting it.',
        success: false,
      };
    }

    if (!confirmed) {
      return {
        narrative:
          'Hard delete is destructive. Re-run with confirmHardDelete=true once you are certain.',
        success: false,
      };
    }

    const property = await this.propertyService.findPropertyById(id);
    await this.propertyService.hardDeleteProperty(id);
    return {
      narrative: `Property "${property?.name ?? id}" was permanently removed from Firestore. All related units were deleted as part of this action.`,
      success: true,
      safety: 'This action cannot be reversed—ensure you have backups if needed.',
    };
  }

  private async handleSummary(): Promise<PropertyAgentResponse> {
    const all = await this.propertyService.findAllProperties();
    const active = all.filter((prop) => prop.status === PropertyStatus.ACTIVE).length;
    const logical = all.filter((prop) => prop.status === PropertyStatus.LOGICALLY_DELETED).length;

    return {
      narrative: `We currently manage ${all.length} properties. ${active} are active, ${logical} are logically deleted.`,
      success: true,
      data: all,
      recommendations: ['Use logical delete before performing any hard deletes.', 'Seed more units for inactive properties to reduce vacancy.'],
    };
  }

  private async handlePriority(): Promise<PropertyAgentResponse> {
    const all = await this.propertyService.findAllProperties();
    if (all.length === 0) {
      return { narrative: 'No properties available yet.', success: false };
    }

    const priority = all.find((prop) => prop.status !== PropertyStatus.ACTIVE) ?? all[0];
    return {
      narrative: `Top priority is "${priority.name}". Its status is ${priority.status}, so consider addressing it first.`,
      success: true,
      data: priority,
      recommendations: ['Check occupancy, outstanding incidents, and potential marketing refresh for this property.'],
    };
  }

  private async handleOccupancy(): Promise<PropertyAgentResponse> {
    const all = await this.propertyService.findAllProperties();
    const totalUnits = all.reduce((sum, prop) => sum + (prop.statistics?.unitCount ?? 0), 0);
    return {
      narrative: `Across ${all.length} properties we track ${totalUnits} units (based on statistics).`,
      success: true,
      recommendations: ['Update your statistics when new units are created for more precise occupancy math.'],
    };
  }
}

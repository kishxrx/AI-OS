import { CreatePropertyDto, PropertyDto } from './property.dto';

export interface IPropertyRepository {
  create(property: CreatePropertyDto): Promise<PropertyDto>;
  findById(id: string): Promise<PropertyDto | null>;
  findByName(name: string): Promise<PropertyDto[]>;
  findAll(): Promise<PropertyDto[]>;
  update(id: string, property: Partial<PropertyDto>): Promise<PropertyDto>;
  delete(id: string): Promise<void>;
  logicalDelete(id: string): Promise<void>;
}

export const I_PROPERTY_REPOSITORY = 'IPropertyRepository';

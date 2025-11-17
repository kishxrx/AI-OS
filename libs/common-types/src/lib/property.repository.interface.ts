import { PropertyDto } from './property.dto';

export interface IPropertyRepository {
  create(property: PropertyDto): Promise<PropertyDto>;
  findById(id: string): Promise<PropertyDto | null>;
  findAll(): Promise<PropertyDto[]>;
  update(id: string, property: Partial<PropertyDto>): Promise<PropertyDto>;
  delete(id: string): Promise<void>;
  logicalDelete(id: string): Promise<void>;
}

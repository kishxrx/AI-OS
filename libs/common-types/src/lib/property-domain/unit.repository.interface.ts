import { CreateUnitDto, UnitDto } from './unit.dto';

export interface IUnitRepository {
  create(unit: CreateUnitDto): Promise<UnitDto>;
  findById(id: string): Promise<UnitDto | null>;
  findAll(): Promise<UnitDto[]>;
  findByPropertyId(propertyId: string): Promise<UnitDto[]>;
  update(id: string, unit: Partial<UnitDto>): Promise<UnitDto>;
  delete(id: string): Promise<void>;
  logicalDelete(id: string): Promise<void>;
}

export const I_UNIT_REPOSITORY = 'IUnitRepository';

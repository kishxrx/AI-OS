import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  I_UNIT_REPOSITORY,
  IUnitRepository,
  CreateUnitDto,
  UnitDto,
} from '@app/common-types';

@Injectable()
export class UnitAiService {
  private readonly logger = new Logger(UnitAiService.name);

  constructor(
    @Inject(I_UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async createUnit(createUnitDto: CreateUnitDto): Promise<UnitDto> {
    this.logger.log(`Attempting to create unit: ${JSON.stringify(createUnitDto)}`);
    const createdUnit = await this.unitRepository.create(createUnitDto);
    this.logger.log(`Unit created successfully with ID: ${createdUnit.id}`);
    return createdUnit;
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
  this.logger.log(`Attempting to find all units.`);
  const units = await this.unitRepository.findAll();
  this.logger.log(`Found ${units.length} units.`);
  return units;
}

// TODO: Implement other CRUD methods for units (update, delete, logicalDelete)
}
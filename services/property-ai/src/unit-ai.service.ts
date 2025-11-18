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

  // TODO: Implement other CRUD methods for units (findById, findAll, update, delete, logicalDelete)
}

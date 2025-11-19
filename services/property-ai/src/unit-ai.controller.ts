import { Controller, Post, Body, Logger, Get, Param, NotFoundException } from '@nestjs/common';
import { UnitAiService } from './unit-ai.service';
import { CreateUnitDto, UnitDto } from '@app/common-types';
import { ApiTags, ApiResponse, ApiBody, ApiParam, ApiNotFoundResponse } from '@nestjs/swagger';


@ApiTags('units')
@Controller('units')
export class UnitAiController {
  private readonly logger = new Logger(UnitAiController.name);

  constructor(private readonly unitAiService: UnitAiService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'The unit has been successfully created.', type: UnitDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateUnitDto })
  async createUnit(@Body() createUnitDto: CreateUnitDto): Promise<UnitDto> {
    this.logger.log(`Received request to create unit: ${JSON.stringify(createUnitDto)}`);
    return this.unitAiService.createUnit(createUnitDto);
  }

  @Get()
@ApiResponse({ status: 200, description: 'Returns all units.', type: [UnitDto] })
async findAllUnits(): Promise<UnitDto[]> {
  this.logger.log('Received request to find all units.');
  return this.unitAiService.findAllUnits();
}

@Get(':id')
@ApiParam({ name: 'id', description: 'The ID of the unit', type: String })
@ApiResponse({ status: 200, description: 'Returns a single unit by ID.', type: UnitDto })
@ApiNotFoundResponse({ description: 'Unit not found.' })
async findUnitById(@Param('id') id: string): Promise<UnitDto> {
  this.logger.log(`Received request to find unit by ID: ${id}`);
  const unit = await this.unitAiService.findUnitById(id);
  if (!unit) {
    throw new NotFoundException(`Unit with ID "${id}" not found.`);
  }
  return unit;
}

  // TODO: Implement other CRUD endpoints for units (GET /units/:id, PUT /units/:id, DELETE /units/:id, PATCH /units/:id/logical-delete)
}

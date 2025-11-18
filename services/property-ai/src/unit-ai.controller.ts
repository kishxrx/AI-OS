import { Controller, Post, Body, Logger } from '@nestjs/common';
import { UnitAiService } from './unit-ai.service';
import { CreateUnitDto, UnitDto } from '@app/common-types';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

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

  // TODO: Implement other CRUD endpoints for units (GET /units, GET /units/:id, PUT /units/:id, DELETE /units/:id, PATCH /units/:id/logical-delete)
}

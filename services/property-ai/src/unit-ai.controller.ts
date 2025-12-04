import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Param,
  NotFoundException,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { UnitAiService } from './unit-ai.service';
import {
  CreateUnitDto,
  UnitDto,
  UpdateUnitDto,
} from '@app/common-types';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';


@ApiTags('units')
@Controller()
export class UnitAiController {
  private readonly logger = new Logger(UnitAiController.name);

  constructor(private readonly unitAiService: UnitAiService) {}

  @Post('properties/:propertyId/units')
  @ApiParam({ name: 'propertyId', description: 'ID of the parent property', type: String })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({ status: 201, description: 'Unit created.', type: UnitDto })
  @ApiNotFoundResponse({ description: 'Property not found.' })
  async createUnit(
    @Param('propertyId') propertyId: string,
    @Body() createUnitDto: CreateUnitDto,
  ): Promise<UnitDto> {
    this.logger.log(`Create unit under property ${propertyId}: ${JSON.stringify(createUnitDto)}`);
    return this.unitAiService.createUnit(propertyId, createUnitDto);
  }

  @Get('properties/:propertyId/units')
  @ApiParam({ name: 'propertyId', description: 'ID of the parent property', type: String })
  @ApiResponse({ status: 200, description: 'Units for the property.', type: [UnitDto] })
  @ApiNotFoundResponse({ description: 'Property not found.' })
  async findUnitsByProperty(@Param('propertyId') propertyId: string): Promise<UnitDto[]> {
    this.logger.log(`Listing units for property ${propertyId}`);
    return this.unitAiService.findUnitsByProperty(propertyId);
  }

  @Get('units')
  @ApiResponse({ status: 200, description: 'Returns all units.', type: [UnitDto] })
  async findAllUnits(): Promise<UnitDto[]> {
    this.logger.log('Listing all units');
    return this.unitAiService.findAllUnits();
  }

  @Get('units/:id')
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

  @Put('units/:id')
  @ApiParam({ name: 'id', description: 'ID of the unit to update', type: String })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({ status: 200, description: 'Unit updated.', type: UnitDto })
  @ApiNotFoundResponse({ description: 'Unit not found.' })
  @ApiBadRequestResponse({ description: 'Update rejected due to active state.' })
  async updateUnit(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<UnitDto> {
    this.logger.log(`Updating unit ${id}: ${JSON.stringify(updateUnitDto)}`);
    return this.unitAiService.updateUnit(id, updateUnitDto);
  }

  @Patch('units/:id/logical-delete')
  @ApiParam({ name: 'id', description: 'ID of the unit to logically delete', type: String })
  @ApiResponse({ status: 200, description: 'Unit marked as under maintenance.' })
  @ApiBadRequestResponse({ description: 'Unit cannot be logically deleted while occupied.' })
  async logicalDeleteUnit(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Logical delete request for unit: ${id}`);
    await this.unitAiService.logicalDeleteUnit(id);
    return { message: 'Unit marked as under maintenance.' };
  }

  @Delete('units/:id')
  @ApiParam({ name: 'id', description: 'ID of the unit to delete', type: String })
  @ApiResponse({ status: 200, description: 'Unit hard deleted.' })
  @ApiBadRequestResponse({ description: 'Unit cannot be hard deleted while occupied.' })
  async deleteUnit(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Hard delete request for unit: ${id}`);
    await this.unitAiService.deleteUnit(id);
    return { message: 'Unit hard deleted.' };
  }
}

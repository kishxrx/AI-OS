import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Query,
  Logger,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { PropertyAiService } from './property-ai.service';
import {
  CreatePropertyDto,
  PropertyDto,
  UpdatePropertyDto,
} from '@app/common-types';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

interface DuplicateCheckRequest {
  propertyId?: string;
  payload?: {
    property?: Partial<PropertyDto>;
    [key: string]: unknown;
  };
}

@ApiTags('properties') // Swagger group tag
@Controller('properties')
export class PropertyAiController {
  private readonly logger = new Logger(PropertyAiController.name); // Controller logger

  constructor(private readonly propertyAiService: PropertyAiService) {}

  @Get('hello')
  getHello(): string {
    this.logger.log('Request: getHello');
    return this.propertyAiService.getHello();
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Property created.', type: PropertyDto })
  @ApiBody({ type: CreatePropertyDto }) // Request body type
  async createProperty(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyDto> {
    this.logger.log(`Create property: ${JSON.stringify(createPropertyDto)}`);
    return this.propertyAiService.createProperty(createPropertyDto);
  }

  @Post('duplicate-check')
  @ApiBody({ description: 'Pre-flight duplicate check payload', required: false })
  @ApiResponse({
    status: 200,
    description: 'Duplicate check result',
    schema: {
      type: 'object',
      properties: {
        cleared: { type: 'boolean' },
        details: { type: 'string' },
      },
    },
  })
  async duplicateCheck(@Body() body: DuplicateCheckRequest): Promise<{ cleared: boolean; details: string }> {
    this.logger.log(`Duplicate check request for propertyId=${body.propertyId ?? 'unknown'}`);
    return this.propertyAiService.duplicateCheck(body);
  }

  @Post('create_property')
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({ status: 201, description: 'Property created via ministry automation.', type: PropertyDto })
  async executeCreateProperty(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyDto> {
    this.logger.log('Execute create_property request received');
    return this.propertyAiService.createProperty(createPropertyDto);
  }

  @Get('by-name')
  @ApiQuery({ name: 'name', description: 'Property name', type: String }) // Query parameter
  @ApiResponse({ status: 200, description: 'Properties found.', type: [PropertyDto] })
  async findPropertyByName(@Query('name') name: string): Promise<PropertyDto[]> {
    this.logger.log(`Find by name: ${name}`);
    return this.propertyAiService.findPropertyByName(name);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Property ID', type: String }) // Path parameter
  @ApiResponse({ status: 200, description: 'Property found.', type: PropertyDto })
  @ApiNotFoundResponse({ description: 'Property not found.' })
  async findPropertyById(@Param('id') id: string): Promise<PropertyDto> {
    this.logger.log(`Find by ID: ${id}`);
    const property = await this.propertyAiService.findPropertyById(id);
    if (!property) throw new NotFoundException(`Property "${id}" not found`);
    return property;
  }

  @Get()
  @ApiResponse({ status: 200, description: 'All properties.', type: [PropertyDto] })
  async findAllProperties(): Promise<PropertyDto[]> {
    this.logger.log('Find all properties');
    return this.propertyAiService.findAllProperties();
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Property ID', type: String })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({ status: 200, description: 'Property updated.', type: PropertyDto })
  @ApiNotFoundResponse({ description: 'Property not found.' })
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyDto> {
    this.logger.log(`Update property ${id}: ${JSON.stringify(updatePropertyDto)}`);
    return this.propertyAiService.updateProperty(id, updatePropertyDto);
  }

  @Patch(':id/logical-delete')
  @ApiParam({ name: 'id', description: 'Property ID to logically delete', type: String })
  @ApiResponse({ status: 200, description: 'Property logically deleted.' })
  @ApiBadRequestResponse({ description: 'Pre-checks failed or property blocked.' })
  async logicalDeleteProperty(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Logical delete request for property: ${id}`);
    await this.propertyAiService.logicalDeleteProperty(id);
    return { message: 'Property marked as logically deleted.' };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Property ID to hard delete', type: String })
  @ApiResponse({ status: 200, description: 'Property hard deleted.' })
  @ApiBadRequestResponse({ description: 'Pre-checks failed or property blocked.' })
  async hardDeleteProperty(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Hard delete request for property: ${id}`);
    await this.propertyAiService.hardDeleteProperty(id);
    return { message: 'Property hard deleted.' };
  }
}

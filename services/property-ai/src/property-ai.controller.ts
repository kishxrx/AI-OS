import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { PropertyAiService } from './property-ai.service';
import { CreatePropertyDto, PropertyDto } from '@app/common-types';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

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
}

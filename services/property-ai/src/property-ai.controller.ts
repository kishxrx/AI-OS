import { Controller, Get, Post, Body } from '@nestjs/common';
import { PropertyAiService } from './property-ai.service';
import { PropertyDto } from '@app/common-types';

@Controller('properties')
export class PropertyAiController {
  constructor(private readonly propertyAiService: PropertyAiService) {}

  @Get()
  getHello(): string {
    return this.propertyAiService.getHello();
  }

  @Post()
  async createProperty(@Body() propertyDto: PropertyDto): Promise<PropertyDto> {
    return this.propertyAiService.createProperty(propertyDto);
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { PropertyDto } from '@app/common-types';

@Injectable()
export class PropertyAiService {
  private readonly logger = new Logger(PropertyAiService.name);

  getHello(): string {
    return 'Hello from Property AI Ministry!';
  }

  async createProperty(propertyDto: PropertyDto): Promise<PropertyDto> {
    this.logger.log(`Received new property: ${JSON.stringify(propertyDto)}`);
    return propertyDto;
  }
}

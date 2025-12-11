import { Injectable, Logger } from '@nestjs/common';
import { PropertyDto } from '@app/common-types';

@Injectable()
export class PropertyApiClient {
  private readonly baseUrl: string;
  private readonly logger = new Logger(PropertyApiClient.name);

  constructor() {
    this.baseUrl = process.env.PROPERTY_API_BASE_URL || 'http://localhost:3000';
  }

  async fetchProperties(): Promise<PropertyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/properties`);
      if (!response.ok) {
        throw new Error(`Property API responded ${response.status}`);
      }
      return (await response.json()) as PropertyDto[];
    } catch (error) {
      this.logger.warn('Unable to fetch properties for Master AI insights', error as Error);
      return [];
    }
  }
}

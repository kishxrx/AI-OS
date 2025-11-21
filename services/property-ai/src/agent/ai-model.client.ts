import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MaintenanceAnalysisDto } from '@app/common-types';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Client for interacting with an external AI model.
 * Encapsulates the logic for making API calls to an AI service.
 */
@Injectable()
export class AiModelClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly modelName: string;
  private readonly logger = new Logger(AiModelClient.name);

  constructor() {
    this.apiKey = process.env.AI_MODEL_API_KEY;
    this.apiUrl = process.env.AI_MODEL_API_URL || 'https://api.fake-ai.com/v1/generate';
    this.modelName = process.env.AI_MODEL_NAME || 'default-model';
  }

  /**
   * Analyzes a maintenance request text using the external AI model.
   * @param text The unstructured text from a user's maintenance request.
   * @returns A Promise that resolves to a structured MaintenanceAnalysisDto.
   */
  async analyzeMaintenanceRequest(text: string): Promise<MaintenanceAnalysisDto> {
    this.logger.log(`Analyzing maintenance request: "${text}"`);

    // The API Key is not added yet, so we will return a mock response.
    // This allows us to test the full application flow without making a real API call.
    if (!this.apiKey) {
      this.logger.warn('AI_MODEL_API_KEY not found. Returning a mock AI analysis for testing purposes.');
      const mockResponse: MaintenanceAnalysisDto = {
        category: 'Plumbing',
        severity: 'High',
        entity: 'kitchen sink',
      };
      return Promise.resolve(mockResponse);
    }
    
    // Placeholder for the real API call logic
    try {
      // Replace this with a real `fetch` call when the API key and URL are ready.
      this.logger.log('Simulating successful AI API call...');
      const mockResponse: MaintenanceAnalysisDto = {
        category: 'Plumbing',
        severity: 'High',
        entity: 'kitchen sink',
      };
      return Promise.resolve(mockResponse);

    } catch (error) {
      this.logger.error(`Error calling AI API: ${error.message}`);
      throw new InternalServerErrorException('Failed to get response from AI');
    }
  }
}

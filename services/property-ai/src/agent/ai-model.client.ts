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
    this.logger.log(`Sending request to AI model for text: "${text}"`);

    // If the API key isn't set, return a mock response for local testing without a key.
    if (!this.apiKey) {
      this.logger.warn('AI_MODEL_API_KEY not found. Returning a mock AI analysis for testing purposes.');
      const mockResponse: MaintenanceAnalysisDto = {
        category: 'Plumbing',
        severity: 'High',
        entity: 'kitchen sink',
      };
      return Promise.resolve(mockResponse);
    }
    
    // Real API call logic
    try {
      const promptText = `Analyze the following maintenance request and provide a structured JSON response. The JSON should contain 'category' (e.g., Plumbing, Electrical, Structural, General), 'severity' (Low, Medium, High, Critical), and 'entity' (the primary object of the request, e.g., 'sink', 'light switch', 'roof').

      Maintenance Request: "${text}"

      Respond only with the JSON object.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: promptText,
          // Add any other parameters specific to your AI API for structured output
          response_format: { type: "json_object" } // Assuming the AI supports JSON response format
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'No additional error info' }));
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
      }

      const data = await response.json();
      // Assuming the AI returns a JSON object that directly matches MaintenanceAnalysisDto
      // Or that the relevant part is in data.choices[0]?.message?.content
      const aiResponseContent = data.choices[0]?.message?.content || data.generated_text;
      
      if (typeof aiResponseContent === 'string') {
        return JSON.parse(aiResponseContent) as MaintenanceAnalysisDto;
      } else if (typeof aiResponseContent === 'object') {
        return aiResponseContent as MaintenanceAnalysisDto;
      }
      
      throw new Error('AI response content not in expected JSON format.');

    } catch (error) {
      this.logger.error(`Error calling AI API: ${error.message}`);
      throw new InternalServerErrorException(`Failed to get response from AI: ${error.message}`);
    }
  }
}

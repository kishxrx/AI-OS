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
    this.apiUrl = process.env.AI_MODEL_URL || 'https://api.fake-ai.com/v1/generate';
    this.modelName = process.env.AI_MODEL_NAME || 'default-model';
  }

  /**
   * Analyzes a maintenance request text using the external AI model.
   * @param text The unstructured text from a user's maintenance request.
   * @returns A Promise that resolves to a structured MaintenanceAnalysisDto.
   */
  async analyzeMaintenanceRequest(text: string): Promise<MaintenanceAnalysisDto> {
    this.logger.log(`Analyzing maintenance request for OpenAI model: "${this.modelName}"`);

    if (!this.apiKey) {
      this.logger.warn('AI_MODEL_API_KEY not found. Returning a mock AI analysis for testing purposes.');
      const mockResponse: MaintenanceAnalysisDto = {
        category: 'Plumbing',
        severity: 'High',
        entity: 'kitchen sink',
      };
      return Promise.resolve(mockResponse);
    }
    
    const systemPrompt = `You are a helpful assistant for a property management system. Your task is to analyze an unstructured maintenance request and provide a structured JSON response. The JSON object must conform to the following format: { "category": "string", "severity": "string", "entity": "string" }. The possible values for 'category' are 'Plumbing', 'Electrical', 'Structural', 'General'. The possible values for 'severity' are 'Low', 'Medium', 'High', 'Critical'. Respond only with the raw JSON object and nothing else.`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'No additional error info' }));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
      }

      const data = await response.json();
      const aiResponseContent = data.choices[0]?.message?.content;

      if (!aiResponseContent) {
        throw new Error('AI response content is empty or in an unexpected format.');
      }
      
      // The AI's response content should be a JSON string, so we parse it.
      return JSON.parse(aiResponseContent) as MaintenanceAnalysisDto;

    } catch (error) {
      this.logger.error(`Error calling OpenAI API: ${error.message}`);
      throw new InternalServerErrorException(`Failed to get response from AI: ${error.message}`);
    }
  }
}

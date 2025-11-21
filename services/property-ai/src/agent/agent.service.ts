import { Injectable, Logger } from '@nestjs/common';
import { AiModelClient } from './ai-model.client';
import { MaintenanceAnalysisDto } from '@app/common-types';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(private readonly aiClient: AiModelClient) {}

  /**
   * Processes an unstructured maintenance request by using the AI model
   * to analyze it and return a structured analysis.
   * @param text The unstructured maintenance request text.
   * @returns The structured analysis from the AI.
   */
  async processMaintenanceRequest(text: string): Promise<MaintenanceAnalysisDto> {
    this.logger.log(`Processing maintenance request with text: "${text}"`);

    // Call the AI client to get the structured analysis
    const analysis = await this.aiClient.analyzeMaintenanceRequest(text);

    this.logger.log(`AI Analysis complete: ${JSON.stringify(analysis)}`);

    // In a real implementation, the next step would be to save this analysis
    // to the database, for example:
    // await this.ticketRepository.create({ text, ...analysis });
    
    return analysis;
  }
}

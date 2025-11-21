import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('maintenance-request')
  processMaintenanceRequest(@Body('text') text: string) {
    // For now, this will delegate the processing to the AgentService
    return this.agentService.processMaintenanceRequest(text);
  }
}

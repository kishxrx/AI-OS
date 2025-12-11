import { Body, Controller, Post } from '@nestjs/common';
import {
  PropertyAgentRequest,
  PropertyAgentResponse,
  PropertyAgentService,
} from './property-agent.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('property-agent')
@Controller('agent/property')
export class PropertyAgentController {
  constructor(private readonly agentService: PropertyAgentService) {}

  @Post()
  @ApiBody({ description: 'Run a guided property action or report' })
  @ApiResponse({ status: 200, description: 'Property agent response with narrative' })
  async run(@Body() request: PropertyAgentRequest): Promise<PropertyAgentResponse> {
    return this.agentService.handleCommand(request);
  }
}

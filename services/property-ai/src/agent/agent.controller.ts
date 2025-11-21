import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { MaintenanceAnalysisDto } from '@app/common-types';

class MaintenanceRequestDto {
  @ApiProperty({
    example: 'The sink in the kitchen of unit 101 is leaking badly.',
    description: 'The unstructured text of the maintenance request.',
  })
  text: string;
}

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('maintenance-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processes an unstructured maintenance request using AI.' })
  @ApiBody({ type: MaintenanceRequestDto })
  @ApiResponse({ status: 200, description: 'The structured analysis of the request.', type: MaintenanceAnalysisDto })
  processMaintenanceRequest(@Body() body: MaintenanceRequestDto): Promise<MaintenanceAnalysisDto> {
    return this.agentService.processMaintenanceRequest(body.text);
  }
}


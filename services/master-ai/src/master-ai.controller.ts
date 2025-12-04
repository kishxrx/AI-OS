import { Body, Controller, Get, Post } from '@nestjs/common';
import { MasterAiService } from './master-ai.service';
import { PropertyLifecycleEvent } from '@app/common-types';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('master-ai')
@Controller('master-ai')
export class MasterAiController {
  constructor(private readonly masterAiService: MasterAiService) {}

  @Post('events')
  @ApiBody({ description: 'Process a lifecycle event via Master AI' })
  @ApiOkResponse({ description: 'Reasoning snapshot for the processed event' })
  processEvent(@Body() event: PropertyLifecycleEvent) {
    return this.masterAiService.processLifecycleEvent(event);
  }

  @Get('history')
  @ApiOkResponse({ description: 'List of reasoning snapshots' })
  history() {
    return this.masterAiService.listSnapshotHistory();
  }
}

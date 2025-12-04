import { Module } from '@nestjs/common';
import { MasterAiService } from './master-ai.service';
import { MasterAiController } from './master-ai.controller';
import { PubSubClient } from '@app/pubsub-sdk';
import { OpaClient } from '@app/opa-client';
import { McpClient } from '@app/mcp-sdk';

@Module({
  imports: [],
  controllers: [MasterAiController],
  providers: [MasterAiService, PubSubClient, OpaClient, McpClient],
})
export class MasterAiModule {}

import { Module } from '@nestjs/common';
import { MasterAiService } from './master-ai.service';
import { MasterAiController } from './master-ai.controller';
import { PubSubClient } from '@app/pubsub-sdk';
import { OpaClient } from '@app/opa-client';
import { McpClient } from '@app/mcp-sdk';
import { MasterAiClient } from './master-ai.client';

@Module({
  imports: [],
  controllers: [MasterAiController],
  providers: [MasterAiService, PubSubClient, OpaClient, McpClient, MasterAiClient],
})
export class MasterAiModule {}

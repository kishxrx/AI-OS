import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AiModelClient } from './ai-model.client';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AiModelClient],
})
export class AgentModule {}

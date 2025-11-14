import { Module } from '@nestjs/common';
import { PropertyAiController } from './property-ai.controller';
import { PropertyAiService } from './property-ai.service';

@Module({
  imports: [],
  controllers: [PropertyAiController],
  providers: [PropertyAiService],
})
export class PropertyAiModule {}

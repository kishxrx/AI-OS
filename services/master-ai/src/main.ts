import { NestFactory } from '@nestjs/core';
import { MasterAiModule } from './master-ai.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(MasterAiModule);
  const port = process.env.PORT || 4000;
  app.setGlobalPrefix('api');
  await app.listen(port);
  Logger.log(`Master AI running on port ${port}`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MasterAiModule } from './master-ai.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MasterAiModule);
  const port = process.env.PORT || 4000;
  app.setGlobalPrefix('api');

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_, res) => res.redirect('/api/docs'));

  const config = new DocumentBuilder()
    .setTitle('Master AI API')
    .setDescription('Orchestration endpoints for the Cabinet Secretary')
    .setVersion('1.0')
    .addTag('master-ai')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  Logger.log(`Master AI running on port ${port}`);
  Logger.log(`Swagger UI available at: http://localhost:${port}/api/docs`);
}

bootstrap();

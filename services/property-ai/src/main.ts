import { NestFactory } from '@nestjs/core';
import { PropertyAiModule } from './property-ai.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(PropertyAiModule);
  const port = process.env.PORT || 3000;

  // Setup Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Property AI API')
    .setDescription('API for managing properties and units within the Property AI Ministry')
    .setVersion('1.0')
    .addTag('properties')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 'api' is the path to access Swagger UI

  await app.listen(port, '0.0.0.0');
  Logger.log(`Property AI Ministry is running on port: ${port}`);
  Logger.log(`Swagger UI available at: http://localhost:${port}/api`);
}

bootstrap();

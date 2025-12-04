import type { INestApplication } from '@nestjs/common';

declare module '@nestjs/swagger' {
  /**
   * Minimal subset of SwaggerModule helpers that the service imports.
   * These declarations compensate for the missing `swagger-module.d.ts` file.
   */
  export class SwaggerModule {
    static createDocument(app: INestApplication, config: unknown, options?: Record<string, unknown>): unknown;
    static setup(path: string, app: INestApplication, document: unknown, options?: Record<string, unknown>): void;
  }
}

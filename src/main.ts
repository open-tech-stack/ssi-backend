import { dirname } from 'node:path';
import { createRequire } from 'node:module';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import type { AppConfig } from './config/configuration.js';

const require = createRequire(import.meta.url);
const swaggerUiPath = dirname(require.resolve('swagger-ui-dist'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  // ---------- Préfixe global ----------
  app.setGlobalPrefix('api');

  // ---------- CORS ----------
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ---------- Validation globale ----------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---------- Swagger ----------
  if (config.get('app.swaggerEnabled', { infer: true })) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SSI API')
      .setDescription(
        "API du backend SSI — SIM SOMGANDE Information. Utilisée par l'application mobile et l'admin web.",
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Token JWT (access token)',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: false,
      jsonDocumentUrl: 'docs-json',
      customSwaggerUiPath: swaggerUiPath,
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'SSI API — Documentation',
    });
  }

  // ---------- Démarrage ----------
  const port = config.get('app.port', { infer: true });

  await app.listen(port);

  console.log(`🚀 API prête sur http://localhost:${port}/api`);

  if (config.get('app.swaggerEnabled', { infer: true })) {
    console.log(`📘 Swagger sur http://localhost:${port}/docs`);
  }
}

bootstrap();


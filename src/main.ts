// src/main.ts
import { join } from 'node:path';

import { ValidationPipe } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';
import type { AppConfig } from './config/configuration.js';

const swaggerUiPath = join(process.cwd(), 'dist/swagger-ui');

/**
 * Construit la liste des origines autorisées pour CORS.
 */
function buildCorsOrigin(isProd: boolean): CorsOptions['origin'] {
  const envOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, '')) 
    .filter(Boolean);

  const DEV_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.11.143:3000',
  ];

  return (origin, callback) => {
    // Pas d'Origin → curl, Postman, mobile natif → autorisé
    if (!origin) return callback(null, true);

    if (!isProd) {
      return callback(null, DEV_ORIGINS.includes(origin));
    }

    // En prod : autorise les origines de l'env + les previews Vercel
    const isConfigured = envOrigins.includes(origin);
    const isPreview = /^https:\/\/ssi-dashboard-[a-z0-9-]+\.vercel\.app$/.test(
      origin,
    );

    return callback(null, isConfigured || isPreview);
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  const isProd = config.get('app.env', { infer: true }) === 'production';

  // ---------- Préfixe global ----------
  app.setGlobalPrefix('api');

  // ---------- Cookie parser ----------
  app.use(cookieParser());

  // ---------- CORS ----------
  app.enableCors({
    origin: buildCorsOrigin(isProd),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Client',
    ],
    maxAge: 86400,
  });

  // ---------- Validation globale ----------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
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
          description:
            'Token JWT (access token). Le dashboard utilise un cookie httpOnly, mais Swagger envoie le header.',
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
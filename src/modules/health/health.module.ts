// src/modules/health/health.module.ts
import { Module } from '@nestjs/common';

import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

/**
 * Module health.
 *
 * Note : PrismaService est injectable directement ici car `PrismaModule`
 * est déclaré `@Global()`.
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
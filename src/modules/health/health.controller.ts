// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator.js';

import { HealthService } from './health.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "État de l'API et de la base de données" })
  @ApiResponse({ status: 200 })
  async check() {
    return this.healthService.check();
  }
}
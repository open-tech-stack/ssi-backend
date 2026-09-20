// src/modules/programmes/programmes.module.ts
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';

import { ProgrammesController } from './programmes.controller.js';
import { ProgrammesService } from './programmes.service.js';
import { ProgrammesRepository } from './repositories/programmes.repository.js';

@Module({
  imports: [NotificationsModule],
  controllers: [ProgrammesController],
  providers: [ProgrammesService, ProgrammesRepository],
  exports: [ProgrammesService, ProgrammesRepository],
})
export class ProgrammesModule {}
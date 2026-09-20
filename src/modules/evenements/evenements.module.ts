// src/modules/evenements/evenements.module.ts
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';

import { EvenementsController } from './evenements.controller.js';
import { EvenementsService } from './evenements.service.js';
import { EvenementsRepository } from './repositories/evenements.repository.js';

@Module({
  imports: [NotificationsModule],
  controllers: [EvenementsController],
  providers: [EvenementsService, EvenementsRepository],
  exports: [EvenementsService, EvenementsRepository],
})
export class EvenementsModule {}
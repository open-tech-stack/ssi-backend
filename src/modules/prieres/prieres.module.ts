// src/modules/prieres/prieres.module.ts
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';

import { PrieresController } from './prieres.controller.js';
import { PrieresService } from './prieres.service.js';
import { PrieresRepository } from './repositories/prieres.repository.js';

@Module({
  imports: [NotificationsModule],
  controllers: [PrieresController],
  providers: [PrieresService, PrieresRepository],
  exports: [PrieresService, PrieresRepository],
})
export class PrieresModule {}
// src/modules/infos/infos.module.ts
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';

import { InfosController } from './infos.controller.js';
import { InfosService } from './infos.service.js';
import { InfosRepository } from './repositories/infos.repository.js';

@Module({
  imports: [NotificationsModule],
  controllers: [InfosController],
  providers: [InfosService, InfosRepository],
  exports: [InfosService, InfosRepository],
})
export class InfosModule {}
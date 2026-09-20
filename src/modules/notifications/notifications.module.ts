// src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';

import { NotificationsHelper } from './notifications.helper.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsRepository } from './repositories/notifications.repository.js';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, NotificationsHelper],
  exports: [NotificationsService, NotificationsRepository, NotificationsHelper],
})
export class NotificationsModule {}
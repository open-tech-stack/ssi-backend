// src/modules/rappels/rappels.module.ts
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module.js';

import { RappelsController } from './rappels.controller.js';
import { RappelsService } from './rappels.service.js';
import { RappelsRepository } from './repositories/rappels.repository.js';

@Module({
  imports: [NotificationsModule],
  controllers: [RappelsController],
  providers: [RappelsService, RappelsRepository],
  exports: [RappelsService, RappelsRepository],
})
export class RappelsModule {}
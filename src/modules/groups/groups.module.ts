// src/modules/groups/groups.module.ts
import { Module } from '@nestjs/common';

import { GroupsController } from './groups.controller.js';
import { GroupsService } from './groups.service.js';
import { GroupsRepository } from './repositories/groups.repository.js';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository],
  exports: [GroupsService, GroupsRepository],
})
export class GroupsModule {}
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './repositories/users.repository.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
// src/modules/people/people.module.ts
import { Module } from '@nestjs/common';

import { PeopleController } from './people.controller.js';
import { PeopleService } from './people.service.js';
import { PeopleRepository } from './repositories/people.repository.js';

@Module({
  controllers: [PeopleController],
  providers: [PeopleService, PeopleRepository],
  exports: [PeopleService, PeopleRepository],
})
export class PeopleModule {}
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { JwtAuthGuard, RolesGuard } from './common/guards/index.js';
import configuration from './config/configuration.js';
import { validateEnv } from './config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { GroupsModule } from './modules/groups/groups.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { PeopleModule } from './modules/people/people.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProgrammesModule } from './modules/programmes/programmes.module.js';
import { EvenementsModule } from './modules/evenements/evenements.module.js';
import { InfosModule } from './modules/infos/infos.module.js';
import { PrieresModule } from './modules/prieres/prieres.module.js';
import { RappelsModule } from './modules/rappels/rappels.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [configuration],
      validate: validateEnv,
    }),

    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    PeopleModule,
    GroupsModule,
    ProgrammesModule,
    EvenementsModule,
    InfosModule,
    PrieresModule,
    RappelsModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
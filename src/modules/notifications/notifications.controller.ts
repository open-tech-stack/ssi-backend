// src/modules/notifications/notifications.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

import { CreateNotificationDto, QueryNotificationsDto } from './dto/index.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ------------------------------------------------------------------
  // READ (ADMIN + MEMBRE)
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les notifications' })
  findAll(@Query() query: QueryNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  countUnread() {
    return this.notificationsService.countUnread();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une notification' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  // ------------------------------------------------------------------
  // MARK READ
  // ------------------------------------------------------------------

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  markAllRead() {
    return this.notificationsService.markAllRead();
  }

  // ------------------------------------------------------------------
  // CREATE (ADMIN)
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une notification (ADMIN)' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  // ------------------------------------------------------------------
  // DELETE (ADMIN)
  // ------------------------------------------------------------------

  @Delete('read')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer toutes les notifications lues (ADMIN)' })
  removeAllRead() {
    return this.notificationsService.removeAllRead();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer (soft) une notification (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
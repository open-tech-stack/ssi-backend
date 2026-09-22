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

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';

import { CreateNotificationDto, QueryNotificationsDto } from './dto/index.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ------------------------------------------------------------------
  // READ (ADMIN + MEMBRE) — personnalisé par user
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les notifications (état lu par user)' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAllForUser(user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de notifications non lues (par user)' })
  countUnread(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.countUnreadForUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une notification' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.findOneForUser(user.sub, id);
  }

  // ------------------------------------------------------------------
  // MARK READ — par user
  // ------------------------------------------------------------------

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue (par user)' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markReadForUser(user.sub, id);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Marquer toutes les notifications comme lues (par user)',
  })
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllReadForUser(user.sub);
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
  // SOFT DELETE (ADMIN)
  // ------------------------------------------------------------------

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer (soft) une notification (ADMIN)',
    description:
      '⚠️ Suppression GLOBALE : la notification disparaît pour tous les utilisateurs.',
  })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  // ------------------------------------------------------------------
  // RESTORE / HARD DELETE (ADMIN)
  // ------------------------------------------------------------------

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restaurer une notification supprimée (ADMIN)' })
  restore(@Param('id') id: string) {
    return this.notificationsService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SUPPRESSION DÉFINITIVE (ADMIN)',
    description: '⚠️ Irréversible.',
  })
  hardDelete(@Param('id') id: string) {
    return this.notificationsService.hardDelete(id);
  }
}
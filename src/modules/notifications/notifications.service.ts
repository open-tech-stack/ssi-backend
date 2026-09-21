// src/modules/notifications/notifications.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { CreateNotificationDto } from './dto/create-notification.dto.js';
import type { QueryNotificationsDto } from './dto/query-notifications.dto.js';
import { NotificationMapper } from './mappers/notification.mapper.js';
import { NotificationsRepository } from './repositories/notifications.repository.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly repo: NotificationsRepository) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateNotificationDto) {
    const notification = await this.repo.create({
      type: dto.type,
      title: dto.title.trim(),
      message: dto.message.trim(),
      linkTo: dto.linkTo?.trim() || null,
      sourceId: dto.sourceId?.trim() || null,
    });

    this.logger.log(
      `Notification créée : ${notification.id} (${notification.type})`,
    );
    // Le read est calculé par user → on renvoie false par défaut
    return NotificationMapper.toResponse({ ...notification, read: false });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAllForUser(userId: string, query: QueryNotificationsDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findManyForUser({
      userId,
      type: query.type,
      read: query.read,
      skip,
      take: query.pageSize,
    });

    return {
      items: NotificationMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOneForUser(userId: string, id: string) {
    const notification = await this.repo.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    // Note : on pourrait ajouter `read` ici, mais l'usage principal
    // est de lister. Garde simple.
    return NotificationMapper.toResponse({ ...notification, read: false });
  }

  async countUnreadForUser(userId: string) {
    const count = await this.repo.countUnreadForUser(userId);
    return { count };
  }

  // ------------------------------------------------------------------
  // MARK READ (par user)
  // ------------------------------------------------------------------
  async markReadForUser(userId: string, id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    await this.repo.markReadForUser(userId, id);
    return { success: true };
  }

  async markAllReadForUser(userId: string) {
    const count = await this.repo.markAllReadForUser(userId);
    return { success: true, count };
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    await this.repo.softDelete(id);
    return { success: true };
  }

  async removeAllReadForUser(userId: string) {
    const count = await this.repo.softDeleteAllReadForUser(userId);
    return { success: true, count };
  }
}
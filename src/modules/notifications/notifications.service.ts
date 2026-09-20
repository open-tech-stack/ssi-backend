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
    return NotificationMapper.toResponse(notification);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryNotificationsDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
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

  async findOne(id: string) {
    const notification = await this.repo.findById(id);
    if (!notification)
      throw new NotFoundException(`Notification ${id} introuvable.`);
    return NotificationMapper.toResponse(notification);
  }

  async countUnread() {
    const count = await this.repo.countUnread();
    return { count };
  }

  // ------------------------------------------------------------------
  // MARK READ
  // ------------------------------------------------------------------
  async markRead(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`Notification ${id} introuvable.`);
    const updated = await this.repo.markRead(id);
    return NotificationMapper.toResponse(updated);
  }

  async markAllRead() {
    const count = await this.repo.markAllRead();
    return { success: true, count };
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`Notification ${id} introuvable.`);
    await this.repo.softDelete(id);
    return { success: true };
  }

  async removeAllRead() {
    const count = await this.repo.softDeleteAllRead();
    return { success: true, count };
  }
}
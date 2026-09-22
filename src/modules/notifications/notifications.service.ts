// src/modules/notifications/notifications.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

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
      deleted: query.deleted,
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
    return NotificationMapper.toResponse({ ...notification, read: false });
  }

  async countUnreadForUser(userId: string) {
    const count = await this.repo.countUnreadForUser(userId);
    return { count };
  }

  // ------------------------------------------------------------------
  // MARK READ
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
  // SOFT DELETE (admin)
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    await this.repo.softDelete(id);
    this.logger.log(`Notification soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE (admin)
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    if (!existing.deletedAt) {
      throw new BadRequestException(
        "Cette notification n'est pas supprimée, impossible de la restaurer.",
      );
    }
    const restored = await this.repo.restore(id);
    this.logger.log(`Notification restaurée : ${id}`);
    return NotificationMapper.toResponse({ ...restored, read: false });
  }

  // ------------------------------------------------------------------
  // HARD DELETE (admin)
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) {
      throw new NotFoundException(`Notification ${id} introuvable.`);
    }
    await this.repo.hardDelete(id);
    this.logger.warn(`Notification SUPPRIMÉE DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
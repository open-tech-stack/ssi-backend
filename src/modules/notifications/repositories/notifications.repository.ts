// src/modules/notifications/repositories/notifications.repository.ts
import { Injectable } from '@nestjs/common';

import type { Notification, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(params: {
    type?: Prisma.NotificationWhereInput['type'];
    read?: boolean;
    skip: number;
    take: number;
  }): Promise<{ items: Notification[]; total: number }> {
    const where: Prisma.NotificationWhereInput = { deletedAt: null };

    if (params.type) where.type = params.type;
    if (params.read !== undefined) where.read = params.read;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  async countUnread(): Promise<number> {
    return this.prisma.notification.count({
      where: { deletedAt: null, read: false },
    });
  }

  async markRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(): Promise<number> {
    const res = await this.prisma.notification.updateMany({
      where: { deletedAt: null, read: false },
      data: { read: true },
    });
    return res.count;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteAllRead(): Promise<number> {
    const res = await this.prisma.notification.updateMany({
      where: { deletedAt: null, read: true },
      data: { deletedAt: new Date() },
    });
    return res.count;
  }
}
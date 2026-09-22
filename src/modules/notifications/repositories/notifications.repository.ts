// src/modules/notifications/repositories/notifications.repository.ts
import { Injectable } from '@nestjs/common';

import type { Notification, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByIdAny(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findManyForUser(params: {
    userId: string;
    type?: Prisma.NotificationWhereInput['type'];
    read?: boolean;
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: (Notification & { read: boolean })[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }
    // 'all' → pas de filtre

    if (params.type) where.type = params.type;

    // Filtre par read : on utilise la relation reads
    if (params.read === true) {
      where.reads = { some: { userId: params.userId } };
    } else if (params.read === false) {
      where.reads = { none: { userId: params.userId } };
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
        include: {
          reads: {
            where: { userId: params.userId },
            select: { readAt: true },
            take: 1,
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    // Transforme : ajoute `read: boolean`
    const enriched = items.map((n) => {
      const { reads, ...notification } = n;
      return {
        ...notification,
        read: reads.length > 0,
      };
    });

    return { items: enriched, total };
  }

  /**
   * Compte les non lues pour un user (uniquement les non supprimées).
   */
  async countUnreadForUser(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        deletedAt: null,
        reads: { none: { userId } },
      },
    });
  }

  // ------------------------------------------------------------------
  // MARK READ (par user)
  // ------------------------------------------------------------------
  async markReadForUser(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notificationRead.upsert({
      where: {
        userId_notificationId: { userId, notificationId },
      },
      create: { userId, notificationId },
      update: {},
    });
  }

  async markAllReadForUser(userId: string): Promise<number> {
    const unread = await this.prisma.notification.findMany({
      where: {
        deletedAt: null,
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unread.length === 0) return 0;

    await this.prisma.notificationRead.createMany({
      data: unread.map((n) => ({ userId, notificationId: n.id })),
      skipDuplicates: true,
    });

    return unread.length;
  }

  // ------------------------------------------------------------------
  // SOFT DELETE (global, admin)
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    await this.prisma.notification.delete({ where: { id } });
  }
}
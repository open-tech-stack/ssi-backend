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

  /**
   * Liste paginée, AVEC le statut `read` calculé pour un user donné.
   *
   * Retourne chaque notification enrichie d'un champ `read: boolean`
   * indiquant si CE user l'a lue.
   */
  async findManyForUser(params: {
    userId: string;
    type?: Prisma.NotificationWhereInput['type'];
    read?: boolean;
    skip: number;
    take: number;
  }): Promise<{ items: (Notification & { read: boolean })[]; total: number }> {
    const where: Prisma.NotificationWhereInput = { deletedAt: null };

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
   * Compte les notifications non lues POUR UN USER donné.
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
  /**
   * Marque une notification comme lue pour un user.
   * Idempotent : si déjà lue, ne fait rien.
   */
  async markReadForUser(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notificationRead.upsert({
      where: {
        userId_notificationId: { userId, notificationId },
      },
      create: { userId, notificationId },
      update: {}, // si déjà lu, ne rien changer
    });
  }

  /**
   * Marque TOUTES les notifications non lues comme lues pour un user.
   * Retourne le nombre de notifications nouvellement marquées.
   */
  async markAllReadForUser(userId: string): Promise<number> {
    // Récupère les notifications non lues pour ce user
    const unread = await this.prisma.notification.findMany({
      where: {
        deletedAt: null,
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unread.length === 0) return 0;

    // Insère les entrées en batch
    await this.prisma.notificationRead.createMany({
      data: unread.map((n) => ({ userId, notificationId: n.id })),
      skipDuplicates: true,
    });

    return unread.length;
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Supprime toutes les notifications LUES PAR UN USER donné.
   */
  async softDeleteAllReadForUser(userId: string): Promise<number> {
    const res = await this.prisma.notification.updateMany({
      where: {
        deletedAt: null,
        reads: { some: { userId } },
      },
      data: { deletedAt: new Date() },
    });
    return res.count;
  }
}
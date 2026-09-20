// src/modules/evenements/repositories/evenements.repository.ts
import { Injectable } from '@nestjs/common';

import type { Evenement, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class EvenementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EvenementCreateInput): Promise<Evenement> {
    return this.prisma.evenement.create({ data });
  }

  async findById(id: string): Promise<Evenement | null> {
    return this.prisma.evenement.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(params: {
    kind?: Prisma.EvenementWhereInput['kind'];
    status?: Prisma.EvenementWhereInput['status'];
    q?: string;
    period?: 'upcoming' | 'past' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: Evenement[]; total: number }> {
    const where: Prisma.EvenementWhereInput = { deletedAt: null };

    if (params.kind) where.kind = params.kind;
    if (params.status) where.status = params.status;

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { summary: { contains: params.q, mode: 'insensitive' } },
        { location: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    if (params.period && params.period !== 'all') {
      const now = new Date();
      if (params.period === 'upcoming') {
        where.OR = [{ startsAt: { gte: now } }, { startsAt: null }];
      } else if (params.period === 'past') {
        where.startsAt = { lt: now };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.evenement.findMany({
        where,
        orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.evenement.count({ where }),
    ]);

    return { items, total };
  }

  async update(
    id: string,
    data: Prisma.EvenementUpdateInput,
  ): Promise<Evenement> {
    return this.prisma.evenement.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.evenement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
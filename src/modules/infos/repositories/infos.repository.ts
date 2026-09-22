// src/modules/infos/repositories/infos.repository.ts
import { Injectable } from '@nestjs/common';

import type { Info, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class InfosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(data: Prisma.InfoCreateInput): Promise<Info> {
    return this.prisma.info.create({ data });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<Info | null> {
    return this.prisma.info.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /** Trouve une info peu importe son état (actif ou supprimé) */
  async findByIdAny(id: string): Promise<Info | null> {
    return this.prisma.info.findUnique({ where: { id } });
  }

  async findMany(params: {
    q?: string;
    priority?: Prisma.InfoWhereInput['priority'];
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: Info[]; total: number }> {
    const where: Prisma.InfoWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }
    // 'all' → pas de filtre

    if (params.priority) where.priority = params.priority;

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { summary: { contains: params.q, mode: 'insensitive' } },
        { detail: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.info.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.info.count({ where }),
    ]);

    return { items, total };
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, data: Prisma.InfoUpdateInput): Promise<Info> {
    return this.prisma.info.update({ where: { id }, data });
  }

  // ------------------------------------------------------------------
  // SOFT DELETE / RESTORE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.info.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Info> {
    return this.prisma.info.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    await this.prisma.info.delete({ where: { id } });
  }
}
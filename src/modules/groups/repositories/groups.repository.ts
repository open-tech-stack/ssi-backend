// src/modules/groups/repositories/groups.repository.ts
import { Injectable } from '@nestjs/common';

import type { Group, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(data: Prisma.GroupCreateInput): Promise<Group> {
    return this.prisma.group.create({ data });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByIdAny(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async findMany(params: {
    q?: string;
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: Group[]; total: number }> {
    const where: Prisma.GroupWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.group.count({ where }),
    ]);

    return { items, total };
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({ where: { id }, data });
  }

  // ------------------------------------------------------------------
  // SOFT DELETE / RESTORE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.group.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Group> {
    return this.prisma.group.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE — définitif
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    await this.prisma.group.delete({ where: { id } });
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.group.count({
      where: { name, deletedAt: null },
    });
    return count > 0;
  }
}
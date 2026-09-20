// src/modules/prieres/repositories/prieres.repository.ts
import { Injectable } from '@nestjs/common';

import type { Priere, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PrieresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PriereCreateInput): Promise<Priere> {
    return this.prisma.priere.create({ data });
  }

  async findById(id: string): Promise<Priere | null> {
    return this.prisma.priere.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Tri par défaut :
   *  - Si `date` est renseignée, les plus proches d'abord (futur → présent).
   *  - Sinon, par date de création décroissante.
   * Prisma ne sait pas trier "date non null d'abord", on trie côté service.
   */
  async findMany(params: {
    q?: string;
    priority?: Prisma.PriereWhereInput['priority'];
    skip: number;
    take: number;
  }): Promise<{ items: Priere[]; total: number }> {
    const where: Prisma.PriereWhereInput = { deletedAt: null };

    if (params.priority) where.priority = params.priority;

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { location: { contains: params.q, mode: 'insensitive' } },
        { detail: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.priere.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.priere.count({ where }),
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.PriereUpdateInput): Promise<Priere> {
    return this.prisma.priere.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.priere.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
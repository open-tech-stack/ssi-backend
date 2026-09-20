// src/modules/infos/repositories/infos.repository.ts
import { Injectable } from '@nestjs/common';

import type { Info, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class InfosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InfoCreateInput): Promise<Info> {
    return this.prisma.info.create({ data });
  }

  async findById(id: string): Promise<Info | null> {
    return this.prisma.info.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Tri par défaut : priorité (URGENT > IMPORTANT > NORMAL)
   * puis date de création la plus récente.
   * Note : Prisma ne sait pas trier par ordre de priorité personnalisé,
   * on trie donc d'abord côté DB par date, et on ajustera par priorité
   * au niveau du service si besoin. Pour rester simple, on trie par date.
   */
  async findMany(params: {
    q?: string;
    priority?: Prisma.InfoWhereInput['priority'];
    skip: number;
    take: number;
  }): Promise<{ items: Info[]; total: number }> {
    const where: Prisma.InfoWhereInput = { deletedAt: null };

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

  async update(id: string, data: Prisma.InfoUpdateInput): Promise<Info> {
    return this.prisma.info.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.info.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
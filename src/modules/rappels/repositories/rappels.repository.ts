// src/modules/rappels/repositories/rappels.repository.ts
import { Injectable } from '@nestjs/common';

import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

import type { RappelWithElements } from '../mappers/rappel.mapper.js';

const RAPPEL_INCLUDE = {
  elements: true,
} satisfies Prisma.RappelInclude;

@Injectable()
export class RappelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE — rappel + éléments en une transaction
  // ------------------------------------------------------------------
  async create(
    data: Omit<Prisma.RappelCreateInput, 'elements'>,
    elements: Array<{ text: string; order: number }>,
  ): Promise<RappelWithElements> {
    return this.prisma.$transaction(async (tx) => {
      const rappel = await tx.rappel.create({ data });

      if (elements.length > 0) {
        await tx.rappelElement.createMany({
          data: elements.map((el) => ({
            rappelId: rappel.id,
            text: el.text,
            order: el.order,
          })),
        });
      }

      return tx.rappel.findUniqueOrThrow({
        where: { id: rappel.id },
        include: RAPPEL_INCLUDE,
      });
    });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<RappelWithElements | null> {
    return this.prisma.rappel.findFirst({
      where: { id, deletedAt: null },
      include: RAPPEL_INCLUDE,
    });
  }

  async findByIdAny(id: string): Promise<RappelWithElements | null> {
    return this.prisma.rappel.findUnique({
      where: { id },
      include: RAPPEL_INCLUDE,
    });
  }

  async findMany(params: {
    q?: string;
    priority?: Prisma.RappelWhereInput['priority'];
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: RappelWithElements[]; total: number }> {
    const where: Prisma.RappelWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }

    if (params.priority) where.priority = params.priority;

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { detail: { contains: params.q, mode: 'insensitive' } },
        {
          elements: {
            some: { text: { contains: params.q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.rappel.findMany({
        where,
        include: RAPPEL_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.rappel.count({ where }),
    ]);

    return { items, total };
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(
    id: string,
    data: Prisma.RappelUpdateInput,
    elements?: Array<{ text: string; order: number }>,
  ): Promise<RappelWithElements> {
    return this.prisma.$transaction(async (tx) => {
      await tx.rappel.update({ where: { id }, data });

      if (elements !== undefined) {
        await tx.rappelElement.deleteMany({ where: { rappelId: id } });

        if (elements.length > 0) {
          await tx.rappelElement.createMany({
            data: elements.map((el) => ({
              rappelId: id,
              text: el.text,
              order: el.order,
            })),
          });
        }
      }

      return tx.rappel.findUniqueOrThrow({
        where: { id },
        include: RAPPEL_INCLUDE,
      });
    });
  }

  // ------------------------------------------------------------------
  // SOFT DELETE / RESTORE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.rappel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<RappelWithElements> {
    return this.prisma.rappel.update({
      where: { id },
      data: { deletedAt: null },
      include: RAPPEL_INCLUDE,
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE — supprime le rappel + ses éléments (cascade)
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    await this.prisma.rappel.delete({ where: { id } });
  }
}
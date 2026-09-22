// src/modules/people/repositories/people.repository.ts
import { Injectable } from '@nestjs/common';

import type { Person, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PeopleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(data: Prisma.PersonCreateInput): Promise<Person> {
    return this.prisma.person.create({ data });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<Person | null> {
    return this.prisma.person.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByIdAny(id: string): Promise<Person | null> {
    return this.prisma.person.findUnique({ where: { id } });
  }

  async findMany(params: {
    q?: string;
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: Person[]; total: number }> {
    const where: Prisma.PersonWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }

    if (params.q) {
      where.OR = [
        { fullName: { contains: params.q, mode: 'insensitive' } },
        { firstName: { contains: params.q, mode: 'insensitive' } },
        { lastName: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.person.count({ where }),
    ]);

    return { items, total };
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, data: Prisma.PersonUpdateInput): Promise<Person> {
    return this.prisma.person.update({ where: { id }, data });
  }

  // ------------------------------------------------------------------
  // SOFT DELETE / RESTORE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.person.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Person> {
    return this.prisma.person.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    await this.prisma.person.delete({ where: { id } });
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  async existsByFullName(fullName: string): Promise<boolean> {
    const count = await this.prisma.person.count({
      where: { fullName, deletedAt: null },
    });
    return count > 0;
  }
}
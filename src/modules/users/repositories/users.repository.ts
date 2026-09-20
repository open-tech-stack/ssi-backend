// src/modules/users/repositories/users.repository.ts
import { Injectable } from '@nestjs/common';

import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

// Type enrichi avec la personne
export type UserWithPerson = Prisma.UserGetPayload<{
  include: { person: true };
}>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<UserWithPerson> {
    return this.prisma.user.create({
      data,
      include: { person: true },
    });
  }

  async findById(id: string): Promise<UserWithPerson | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { person: true },
    });
  }

  async findByCode(code: string): Promise<UserWithPerson | null> {
    return this.prisma.user.findFirst({
      where: { code, deletedAt: null },
      include: { person: true },
    });
  }

  async findByPersonId(personId: string): Promise<UserWithPerson | null> {
    return this.prisma.user.findFirst({
      where: { personId, deletedAt: null },
      include: { person: true },
    });
  }

  async findMany(params: {
    role?: Prisma.UserWhereInput['role'];
    codeContains?: string;
    skip: number;
    take: number;
  }): Promise<{ items: UserWithPerson[]; total: number }> {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (params.role) where.role = params.role;
    if (params.codeContains) {
      where.code = { contains: params.codeContains, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { person: true },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithPerson> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { person: true },
    });
  }

  async softDelete(id: string): Promise<UserWithPerson> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { person: true },
    });
  }

  async existsByPersonId(personId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { personId, deletedAt: null },
    });
    return count > 0;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { code } });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.prisma.user.count({ where: { deletedAt: null } });
  }
}
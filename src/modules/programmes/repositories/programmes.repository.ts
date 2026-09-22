// src/modules/programmes/repositories/programmes.repository.ts
import { Injectable } from '@nestjs/common';

import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

import type { ProgrammeWithRelations } from '../mappers/programme.mapper.js';

const PROGRAMME_INCLUDE = {
  sections: {
    include: {
      persons: {
        include: { person: true },
      },
      group: true,
    },
  },
} satisfies Prisma.ProgrammeInclude;

@Injectable()
export class ProgrammesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(
    data: Omit<Prisma.ProgrammeCreateInput, 'sections'>,
    sections: Array<{
      key: Prisma.ProgrammeSectionCreateInput['key'];
      label: string;
      order: number;
      value?: string | null;
      personIds?: string[];
      groupId?: string | null;
    }>,
  ): Promise<ProgrammeWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const programme = await tx.programme.create({ data });

      for (const s of sections) {
        const created = await tx.programmeSection.create({
          data: {
            key: s.key,
            label: s.label,
            order: s.order,
            value: s.value ?? null,
            programme: { connect: { id: programme.id } },
            group: s.groupId ? { connect: { id: s.groupId } } : undefined,
          },
        });

        if (s.personIds && s.personIds.length > 0) {
          await tx.programmeSectionPerson.createMany({
            data: s.personIds.map((personId) => ({
              sectionId: created.id,
              personId,
            })),
          });
        }
      }

      return tx.programme.findUniqueOrThrow({
        where: { id: programme.id },
        include: PROGRAMME_INCLUDE,
      });
    });
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findById(id: string): Promise<ProgrammeWithRelations | null> {
    return this.prisma.programme.findFirst({
      where: { id, deletedAt: null },
      include: PROGRAMME_INCLUDE,
    });
  }

  /**
   * Trouve un programme peu importe son état (actif ou supprimé).
   * Utile pour restore/hardDelete.
   */
  async findByIdAny(id: string): Promise<ProgrammeWithRelations | null> {
    return this.prisma.programme.findUnique({
      where: { id },
      include: PROGRAMME_INCLUDE,
    });
  }

  async findMany(params: {
    kind?: Prisma.ProgrammeWhereInput['kind'];
    status?: Prisma.ProgrammeWhereInput['status'];
    q?: string;
    period?: 'upcoming' | 'past' | 'all';
    deleted?: 'active' | 'deleted' | 'all';
    skip: number;
    take: number;
  }): Promise<{ items: ProgrammeWithRelations[]; total: number }> {
    const where: Prisma.ProgrammeWhereInput = {};

    // Filtre soft delete
    if (params.deleted === 'active' || !params.deleted) {
      where.deletedAt = null;
    } else if (params.deleted === 'deleted') {
      where.deletedAt = { not: null };
    }
    // 'all' → pas de filtre

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
      this.prisma.programme.findMany({
        where,
        include: PROGRAMME_INCLUDE,
        orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.programme.count({ where }),
    ]);

    return { items, total };
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(
    id: string,
    data: Prisma.ProgrammeUpdateInput,
    sections?: Array<{
      key: Prisma.ProgrammeSectionCreateInput['key'];
      label: string;
      order: number;
      value?: string | null;
      personIds?: string[];
      groupId?: string | null;
    }>,
  ): Promise<ProgrammeWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      await tx.programme.update({ where: { id }, data });

      if (sections) {
        await tx.programmeSection.deleteMany({ where: { programmeId: id } });

        for (const s of sections) {
          const created = await tx.programmeSection.create({
            data: {
              key: s.key,
              label: s.label,
              order: s.order,
              value: s.value ?? null,
              programme: { connect: { id } },
              group: s.groupId ? { connect: { id: s.groupId } } : undefined,
            },
          });

          if (s.personIds && s.personIds.length > 0) {
            await tx.programmeSectionPerson.createMany({
              data: s.personIds.map((personId) => ({
                sectionId: created.id,
                personId,
              })),
            });
          }
        }
      }

      return tx.programme.findUniqueOrThrow({
        where: { id },
        include: PROGRAMME_INCLUDE,
      });
    });
  }

  // ------------------------------------------------------------------
  // SOFT DELETE / RESTORE
  // ------------------------------------------------------------------
  async softDelete(id: string): Promise<void> {
    await this.prisma.programme.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<ProgrammeWithRelations> {
    return this.prisma.programme.update({
      where: { id },
      data: { deletedAt: null },
      include: PROGRAMME_INCLUDE,
    });
  }

  // ------------------------------------------------------------------
  // HARD DELETE — définitif, irréversible
  // ------------------------------------------------------------------
  async hardDelete(id: string): Promise<void> {
    // Grâce aux onDelete: Cascade sur ProgrammeSection, les sections
    // sont supprimées automatiquement. Idem pour ProgrammeSectionPerson.
    await this.prisma.programme.delete({ where: { id } });
  }
}
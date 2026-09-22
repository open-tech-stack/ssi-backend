// src/modules/prieres/prieres.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { NotificationsHelper } from '../notifications/notifications.helper.js';

import type { CreatePriereDto } from './dto/create-priere.dto.js';
import type { QueryPrieresDto } from './dto/query-prieres.dto.js';
import type { UpdatePriereDto } from './dto/update-priere.dto.js';
import { PriereMapper } from './mappers/priere.mapper.js';
import { PrieresRepository } from './repositories/prieres.repository.js';

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0,
  IMPORTANT: 1,
  NORMAL: 2,
};

@Injectable()
export class PrieresService {
  private readonly logger = new Logger(PrieresService.name);

  constructor(
    private readonly repo: PrieresRepository,
    private readonly notifications: NotificationsHelper,
  ) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreatePriereDto) {
    const priere = await this.repo.create({
      title: dto.title.trim(),
      date: dto.date ? new Date(dto.date) : null,
      location: dto.location?.trim() || null,
      detail: dto.detail?.trim() || null,
      priority: dto.priority ?? 'NORMAL',
      notification: dto.notification ?? false,
    });

    this.logger.log(`Prière créée : ${priere.id} (${priere.title})`);

    if (dto.notification === true) {
      await this.notifications.notifyPriere({
        id: priere.id,
        title: priere.title,
      });
    }

    return PriereMapper.toResponse(priere);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryPrieresDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      q: query.q,
      priority: query.priority,
      deleted: query.deleted,
      skip,
      take: query.pageSize,
    });

    const sorted = [...items].sort((a, b) => {
      const pr =
        (PRIORITY_RANK[a.priority] ?? 99) -
        (PRIORITY_RANK[b.priority] ?? 99);
      if (pr !== 0) return pr;

      const da = a.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = b.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (da !== db) return da - db;

      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      items: PriereMapper.toResponseList(sorted),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const priere = await this.repo.findById(id);
    if (!priere) throw new NotFoundException(`Prière ${id} introuvable.`);
    return PriereMapper.toResponse(priere);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdatePriereDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Prière ${id} introuvable.`);

    const updated = await this.repo.update(id, {
      title: dto.title?.trim(),
      date:
        dto.date !== undefined
          ? dto.date
            ? new Date(dto.date)
            : null
          : undefined,
      location:
        dto.location !== undefined ? dto.location?.trim() || null : undefined,
      detail:
        dto.detail !== undefined ? dto.detail?.trim() || null : undefined,
      priority: dto.priority,
      notification: dto.notification,
    });

    return PriereMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // SOFT DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Prière ${id} introuvable.`);

    await this.repo.softDelete(id);
    this.logger.log(`Prière soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Prière ${id} introuvable.`);
    if (!existing.deletedAt) {
      throw new BadRequestException(
        "Cette prière n'est pas supprimée, impossible de la restaurer.",
      );
    }

    const restored = await this.repo.restore(id);
    this.logger.log(`Prière restaurée : ${id}`);
    return PriereMapper.toResponse(restored);
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Prière ${id} introuvable.`);

    await this.repo.hardDelete(id);
    this.logger.warn(`Prière SUPPRIMÉE DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
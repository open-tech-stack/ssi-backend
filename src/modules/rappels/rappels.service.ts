// src/modules/rappels/rappels.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { NotificationsHelper } from '../notifications/notifications.helper.js';

import type { CreateRappelDto } from './dto/create-rappel.dto.js';
import type { QueryRappelsDto } from './dto/query-rappels.dto.js';
import type { UpdateRappelDto } from './dto/update-rappel.dto.js';
import { RappelMapper } from './mappers/rappel.mapper.js';
import { RappelsRepository } from './repositories/rappels.repository.js';

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0,
  IMPORTANT: 1,
  NORMAL: 2,
};

@Injectable()
export class RappelsService {
  private readonly logger = new Logger(RappelsService.name);

  constructor(
    private readonly repo: RappelsRepository,
    private readonly notifications: NotificationsHelper,
  ) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateRappelDto) {
    const data = {
      title: dto.title.trim(),
      detail: dto.detail?.trim() || null,
      priority: dto.priority ?? 'NORMAL',
      notification: dto.notification ?? false,
    };

    const elements = (dto.elements ?? []).map((el, idx) => ({
      text: el.text.trim(),
      order: el.order ?? idx,
    }));

    const rappel = await this.repo.create(data, elements);
    this.logger.log(`Rappel créé : ${rappel.id} (${rappel.title})`);

    // 🔔 Notification UNIQUEMENT si le flag est activé
    if (dto.notification === true) {
      await this.notifications.notifyRappel({
        id: rappel.id,
        title: rappel.title,
        detail: rappel.detail,
      });
    }

    return RappelMapper.toResponse(rappel);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryRappelsDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      q: query.q,
      priority: query.priority,
      skip,
      take: query.pageSize,
    });

    const sorted = [...items].sort((a, b) => {
      const pr =
        (PRIORITY_RANK[a.priority] ?? 99) -
        (PRIORITY_RANK[b.priority] ?? 99);
      if (pr !== 0) return pr;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      items: RappelMapper.toResponseList(sorted),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const rappel = await this.repo.findById(id);
    if (!rappel) throw new NotFoundException(`Rappel ${id} introuvable.`);
    return RappelMapper.toResponse(rappel);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateRappelDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Rappel ${id} introuvable.`);

    const data = {
      title: dto.title?.trim(),
      detail:
        dto.detail !== undefined ? dto.detail?.trim() || null : undefined,
      priority: dto.priority,
      notification: dto.notification,
    };

    const elements = dto.elements
      ? dto.elements.map((el, idx) => ({
          text: el.text.trim(),
          order: el.order ?? idx,
        }))
      : undefined;

    const updated = await this.repo.update(id, data, elements);
    return RappelMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // DELETE (soft)
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Rappel ${id} introuvable.`);

    await this.repo.softDelete(id);
    return { success: true };
  }
}
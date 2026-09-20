// src/modules/infos/infos.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { NotificationsHelper } from '../notifications/notifications.helper.js';

import type { CreateInfoDto } from './dto/create-info.dto.js';
import type { QueryInfosDto } from './dto/query-infos.dto.js';
import type { UpdateInfoDto } from './dto/update-info.dto.js';
import { InfoMapper } from './mappers/info.mapper.js';
import { InfosRepository } from './repositories/infos.repository.js';

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0,
  IMPORTANT: 1,
  NORMAL: 2,
};

@Injectable()
export class InfosService {
  private readonly logger = new Logger(InfosService.name);

  constructor(
    private readonly repo: InfosRepository,
    private readonly notifications: NotificationsHelper,
  ) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateInfoDto) {
    const info = await this.repo.create({
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      detail: dto.detail?.trim() || null,
      priority: dto.priority ?? 'NORMAL',
      notification: dto.notification ?? false,
    });

    this.logger.log(`Info créée : ${info.id} (${info.title})`);

    // 🔔 Notification UNIQUEMENT si le flag est activé
    if (dto.notification === true) {
      await this.notifications.notifyInfo({
        id: info.id,
        title: info.title,
        summary: info.summary,
      });
    }

    return InfoMapper.toResponse(info);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryInfosDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      q: query.q,
      priority: query.priority,
      skip,
      take: query.pageSize,
    });

    const sorted = [...items].sort(
      (a, b) =>
        (PRIORITY_RANK[a.priority] ?? 99) -
        (PRIORITY_RANK[b.priority] ?? 99),
    );

    return {
      items: InfoMapper.toResponseList(sorted),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const info = await this.repo.findById(id);
    if (!info) throw new NotFoundException(`Info ${id} introuvable.`);
    return InfoMapper.toResponse(info);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateInfoDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Info ${id} introuvable.`);

    const updated = await this.repo.update(id, {
      title: dto.title?.trim(),
      summary: dto.summary?.trim(),
      detail:
        dto.detail !== undefined ? dto.detail?.trim() || null : undefined,
      priority: dto.priority,
      notification: dto.notification,
    });

    return InfoMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // DELETE (soft)
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Info ${id} introuvable.`);

    await this.repo.softDelete(id);
    return { success: true };
  }
}
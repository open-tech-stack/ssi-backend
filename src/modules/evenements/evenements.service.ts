// src/modules/evenements/evenements.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { NotificationsHelper } from '../notifications/notifications.helper.js';

import type { CreateEvenementDto } from './dto/create-evenement.dto.js';
import type { QueryEvenementsDto } from './dto/query-evenements.dto.js';
import type { UpdateEvenementDto } from './dto/update-evenement.dto.js';
import { EvenementMapper } from './mappers/evenement.mapper.js';
import { EvenementsRepository } from './repositories/evenements.repository.js';
import {
  assertKindRequirements,
  sanitizeFieldsForKind,
} from './utils/kind-rules.js';

@Injectable()
export class EvenementsService {
  private readonly logger = new Logger(EvenementsService.name);

  constructor(
    private readonly repo: EvenementsRepository,
    private readonly notifications: NotificationsHelper,
  ) {}

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  private buildData(dto: CreateEvenementDto | UpdateEvenementDto) {
    if (dto.kind) {
      assertKindRequirements(dto.kind, {
        brideName: dto.brideName,
        groomName: dto.groomName,
        ceremonyPlace: dto.ceremonyPlace,
        audience: dto.audience,
        theme: dto.theme,
        speaker: dto.speaker,
        trainer: dto.trainer,
      });
    }

    const sanitized = dto.kind
      ? sanitizeFieldsForKind({
          kind: dto.kind,
          brideName: dto.brideName,
          groomName: dto.groomName,
          townHallTime: dto.townHallTime,
          townHallPlace: dto.townHallPlace,
          ceremonyTime: dto.ceremonyTime,
          ceremonyPlace: dto.ceremonyPlace,
          receptionPlace: dto.receptionPlace,
          audience: dto.audience,
          audienceOther: dto.audienceOther,
          theme: dto.theme,
          speaker: dto.speaker,
          trainer: dto.trainer,
        })
      : dto;

    return {
      kind: dto.kind,
      title: dto.title?.trim(),
      summary: dto.summary?.trim(),
      detail: dto.detail !== undefined ? dto.detail?.trim() || null : undefined,
      priority: dto.priority,
      status: dto.status,
      location:
        dto.location !== undefined ? dto.location?.trim() || null : undefined,
      publishedAt:
        dto.publishedAt !== undefined
          ? dto.publishedAt
            ? new Date(dto.publishedAt)
            : null
          : undefined,
      startsAt:
        dto.startsAt !== undefined
          ? dto.startsAt
            ? new Date(dto.startsAt)
            : null
          : undefined,
      endsAt:
        dto.endsAt !== undefined
          ? dto.endsAt
            ? new Date(dto.endsAt)
            : null
          : undefined,
      expiresAt:
        dto.expiresAt !== undefined
          ? dto.expiresAt
            ? new Date(dto.expiresAt)
            : null
          : undefined,
      notification: dto.notification,

      brideName: sanitized.brideName ?? undefined,
      groomName: sanitized.groomName ?? undefined,
      townHallTime: sanitized.townHallTime ?? undefined,
      townHallPlace: sanitized.townHallPlace ?? undefined,
      ceremonyTime: sanitized.ceremonyTime ?? undefined,
      ceremonyPlace: sanitized.ceremonyPlace ?? undefined,
      receptionPlace: sanitized.receptionPlace ?? undefined,

      audience: sanitized.audience ?? undefined,
      audienceOther: sanitized.audienceOther ?? undefined,
      theme: sanitized.theme ?? undefined,

      speaker: sanitized.speaker ?? undefined,
      trainer: sanitized.trainer ?? undefined,
    };
  }

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateEvenementDto) {
    const data = this.buildData(dto);
    const created = await this.repo.create(data as any);
    this.logger.log(`Événement créé : ${created.id} (${created.kind})`);

    if (dto.notification === true) {
      await this.notifications.notifyEvenement({
        id: created.id,
        title: created.title,
        summary: created.summary,
      });
    }

    return EvenementMapper.toResponse(created);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryEvenementsDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      kind: query.kind,
      status: query.status,
      q: query.q,
      period: query.period,
      deleted: query.deleted,
      skip,
      take: query.pageSize,
    });

    return {
      items: EvenementMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const evenement = await this.repo.findById(id);
    if (!evenement)
      throw new NotFoundException(`Événement ${id} introuvable.`);
    return EvenementMapper.toResponse(evenement);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateEvenementDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Événement ${id} introuvable.`);

    const effectiveKind = dto.kind ?? existing.kind;
    assertKindRequirements(effectiveKind, {
      brideName: dto.brideName ?? existing.brideName,
      groomName: dto.groomName ?? existing.groomName,
      ceremonyPlace: dto.ceremonyPlace ?? existing.ceremonyPlace,
      audience: dto.audience ?? existing.audience,
      theme: dto.theme ?? existing.theme,
      speaker: dto.speaker ?? existing.speaker,
      trainer: dto.trainer ?? existing.trainer,
    });

    const data = this.buildData({ ...dto, kind: effectiveKind });
    const updated = await this.repo.update(id, data as any);
    return EvenementMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // SOFT DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Événement ${id} introuvable.`);

    await this.repo.softDelete(id);
    this.logger.log(`Événement soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Événement ${id} introuvable.`);
    if (!existing.deletedAt) {
      throw new BadRequestException(
        "Cet événement n'est pas supprimé, impossible de le restaurer.",
      );
    }

    const restored = await this.repo.restore(id);
    this.logger.log(`Événement restauré : ${id}`);
    return EvenementMapper.toResponse(restored);
  }

  // ------------------------------------------------------------------
  // HARD DELETE — définitif
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Événement ${id} introuvable.`);

    await this.repo.hardDelete(id);
    this.logger.warn(`Événement SUPPRIMÉ DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
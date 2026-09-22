// src/modules/programmes/programmes.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { NotificationsHelper } from '../notifications/notifications.helper.js';

import type { CreateProgrammeDto } from './dto/create-programme.dto.js';
import type { QueryProgrammesDto } from './dto/query-programmes.dto.js';
import type { UpdateProgrammeDto } from './dto/update-programme.dto.js';
import { ProgrammeMapper } from './mappers/programme.mapper.js';
import { ProgrammesRepository } from './repositories/programmes.repository.js';

@Injectable()
export class ProgrammesService {
  private readonly logger = new Logger(ProgrammesService.name);

  constructor(
    private readonly repo: ProgrammesRepository,
    private readonly notifications: NotificationsHelper,
  ) {}

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  private assertKindRules(dto: {
    kind: string;
    hasHolyCommunion?: boolean | null;
    holyCommunionMessage?: string | null;
  }) {
    if (dto.kind === 'PRIERE_VENDREDI') {
      if (dto.hasHolyCommunion || dto.holyCommunionMessage) {
        throw new BadRequestException(
          'La Sainte-Cène est uniquement pour un CULTE_DIMANCHE.',
        );
      }
    }
  }

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateProgrammeDto) {
    this.assertKindRules({
      kind: dto.kind,
      hasHolyCommunion: dto.hasHolyCommunion,
      holyCommunionMessage: dto.holyCommunionMessage,
    });

    const data = {
      kind: dto.kind,
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      content: dto.content?.trim() || null,
      priority: dto.priority ?? 'NORMAL',
      status: dto.status ?? 'A_VENIR',
      location: dto.location?.trim() || null,
      hasHolyCommunion: dto.hasHolyCommunion ?? null,
      holyCommunionMessage: dto.holyCommunionMessage?.trim() || null,
      notes: dto.notes?.trim() || null,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      notification: dto.notification ?? false,
    };

    const sections = dto.sections.map((s, idx) => ({
      key: s.key,
      label: s.label,
      order: s.order ?? idx,
      value: s.value ?? null,
      personIds: s.personIds ?? [],
      groupId: s.groupId ?? null,
    }));

    const programme = await this.repo.create(data, sections);
    this.logger.log(`Programme créé : ${programme.id} (${programme.title})`);

    if (dto.notification === true) {
      await this.notifications.notifyProgramme({
        id: programme.id,
        title: programme.title,
        summary: programme.summary,
      });
    }

    return ProgrammeMapper.toResponse(programme);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryProgrammesDto) {
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
      items: ProgrammeMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const programme = await this.repo.findById(id);
    if (!programme)
      throw new NotFoundException(`Programme ${id} introuvable.`);
    return ProgrammeMapper.toResponse(programme);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateProgrammeDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Programme ${id} introuvable.`);

    const nextKind = dto.kind ?? existing.kind;
    const nextHasHC =
      dto.hasHolyCommunion !== undefined
        ? dto.hasHolyCommunion
        : existing.hasHolyCommunion;
    const nextMsg =
      dto.holyCommunionMessage !== undefined
        ? dto.holyCommunionMessage
        : existing.holyCommunionMessage;

    this.assertKindRules({
      kind: nextKind,
      hasHolyCommunion: nextHasHC,
      holyCommunionMessage: nextMsg,
    });

    const data = {
      kind: dto.kind,
      title: dto.title?.trim(),
      summary: dto.summary?.trim(),
      content:
        dto.content !== undefined ? dto.content?.trim() || null : undefined,
      priority: dto.priority,
      status: dto.status,
      location:
        dto.location !== undefined ? dto.location?.trim() || null : undefined,
      hasHolyCommunion:
        dto.hasHolyCommunion !== undefined ? dto.hasHolyCommunion : undefined,
      holyCommunionMessage:
        dto.holyCommunionMessage !== undefined
          ? dto.holyCommunionMessage?.trim() || null
          : undefined,
      notes:
        dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
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
    };

    const sections = dto.sections
      ? dto.sections.map((s, idx) => ({
          key: s.key,
          label: s.label,
          order: s.order ?? idx,
          value: s.value ?? null,
          personIds: s.personIds ?? [],
          groupId: s.groupId ?? null,
        }))
      : undefined;

    const updated = await this.repo.update(id, data, sections);
    return ProgrammeMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // SOFT DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Programme ${id} introuvable.`);

    await this.repo.softDelete(id);
    this.logger.log(`Programme soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Programme ${id} introuvable.`);
    if (!existing.deletedAt) {
      throw new BadRequestException(
        'Ce programme n\'est pas supprimé, impossible de le restaurer.',
      );
    }

    const restored = await this.repo.restore(id);
    this.logger.log(`Programme restauré : ${id}`);
    return ProgrammeMapper.toResponse(restored);
  }

  // ------------------------------------------------------------------
  // HARD DELETE — définitif
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Programme ${id} introuvable.`);

    await this.repo.hardDelete(id);
    this.logger.warn(`Programme SUPPRIMÉ DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
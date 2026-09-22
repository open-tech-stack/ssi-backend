// src/modules/people/people.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import type { CreatePersonDto } from './dto/create-person.dto.js';
import type { QueryPeopleDto } from './dto/query-people.dto.js';
import type { UpdatePersonDto } from './dto/update-person.dto.js';
import { PersonMapper } from './mappers/person.mapper.js';
import { PeopleRepository } from './repositories/people.repository.js';

@Injectable()
export class PeopleService {
  private readonly logger = new Logger(PeopleService.name);

  constructor(private readonly repo: PeopleRepository) {}

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  private buildFullName(dto: {
    firstName: string;
    lastName?: string | null;
    fullName?: string | null;
  }): string {
    if (dto.fullName && dto.fullName.trim().length > 0) {
      return dto.fullName.trim();
    }
    return [dto.firstName, dto.lastName]
      .filter((s) => s && s.trim().length > 0)
      .join(' ')
      .trim();
  }

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreatePersonDto) {
    const fullName = this.buildFullName(dto);

    const exists = await this.repo.existsByFullName(fullName);
    if (exists) {
      throw new ConflictException(
        `Une personne nommée « ${fullName} » existe déjà.`,
      );
    }

    const person = await this.repo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName?.trim() || null,
      fullName,
      role: dto.role?.trim() || null,
      avatar: dto.avatar?.trim() || null,
    });

    this.logger.log(`Person créée : ${person.id} (${person.fullName})`);
    return PersonMapper.toResponse(person);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryPeopleDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      q: query.q,
      deleted: query.deleted,
      skip,
      take: query.pageSize,
    });

    return {
      items: PersonMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  /**
   * Version publique minimale (id + fullName) — utilisée par le mobile.
   */
  async findAllPublic(query: QueryPeopleDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      q: query.q,
      deleted: 'active', // toujours actives
      skip,
      take: query.pageSize,
    });

    return {
      items: PersonMapper.toPublicList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const person = await this.repo.findById(id);
    if (!person) throw new NotFoundException(`Person ${id} introuvable.`);
    return PersonMapper.toResponse(person);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdatePersonDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Person ${id} introuvable.`);

    const nextFirstName = dto.firstName ?? existing.firstName;
    const nextLastName =
      dto.lastName !== undefined ? dto.lastName : existing.lastName;
    const nextFullName = this.buildFullName({
      firstName: nextFirstName,
      lastName: nextLastName,
      fullName: dto.fullName ?? existing.fullName,
    });

    if (nextFullName !== existing.fullName) {
      const exists = await this.repo.existsByFullName(nextFullName);
      if (exists) {
        throw new ConflictException(
          `Une personne nommée « ${nextFullName} » existe déjà.`,
        );
      }
    }

    const updated = await this.repo.update(id, {
      firstName: nextFirstName.trim(),
      lastName: nextLastName?.trim() || null,
      fullName: nextFullName,
      role: dto.role !== undefined ? dto.role?.trim() || null : undefined,
      avatar: dto.avatar !== undefined ? dto.avatar?.trim() || null : undefined,
    });

    return PersonMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // SOFT DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Person ${id} introuvable.`);

    await this.repo.softDelete(id);
    this.logger.log(`Person soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Person ${id} introuvable.`);
    if (!existing.deletedAt) {
      throw new BadRequestException(
        "Cette personne n'est pas supprimée, impossible de la restaurer.",
      );
    }

    const restored = await this.repo.restore(id);
    this.logger.log(`Person restaurée : ${id}`);
    return PersonMapper.toResponse(restored);
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Person ${id} introuvable.`);

    await this.repo.hardDelete(id);
    this.logger.warn(`Person SUPPRIMÉE DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
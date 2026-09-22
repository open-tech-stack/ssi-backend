// src/modules/groups/groups.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import type { CreateGroupDto } from './dto/create-group.dto.js';
import type { QueryGroupsDto } from './dto/query-groups.dto.js';
import type { UpdateGroupDto } from './dto/update-group.dto.js';
import { GroupMapper } from './mappers/group.mapper.js';
import { GroupsRepository } from './repositories/groups.repository.js';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(private readonly repo: GroupsRepository) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateGroupDto) {
    const name = dto.name.trim();
    if (await this.repo.existsByName(name)) {
      throw new ConflictException(`Un groupe nommé « ${name} » existe déjà.`);
    }

    const group = await this.repo.create({
      name,
      description: dto.description?.trim() || null,
    });

    this.logger.log(`Group créé : ${group.id} (${group.name})`);
    return GroupMapper.toResponse(group);
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryGroupsDto) {
    const skip = (query.page - 1) * query.pageSize;
    const { items, total } = await this.repo.findMany({
      q: query.q,
      deleted: query.deleted,
      skip,
      take: query.pageSize,
    });

    return {
      items: GroupMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const group = await this.repo.findById(id);
    if (!group) throw new NotFoundException(`Group ${id} introuvable.`);
    return GroupMapper.toResponse(group);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateGroupDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Group ${id} introuvable.`);

    if (dto.name && dto.name.trim() !== existing.name) {
      const name = dto.name.trim();
      if (await this.repo.existsByName(name)) {
        throw new ConflictException(`Un groupe nommé « ${name} » existe déjà.`);
      }
    }

    const updated = await this.repo.update(id, {
      name: dto.name?.trim(),
      description:
        dto.description !== undefined
          ? dto.description?.trim() || null
          : undefined,
    });

    return GroupMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // SOFT DELETE
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Group ${id} introuvable.`);

    await this.repo.softDelete(id);
    this.logger.log(`Group soft-deleted : ${id}`);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // RESTORE
  // ------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Group ${id} introuvable.`);
    if (!existing.deletedAt) {
      throw new BadRequestException(
        "Ce groupe n'est pas supprimé, impossible de le restaurer.",
      );
    }

    const restored = await this.repo.restore(id);
    this.logger.log(`Group restauré : ${id}`);
    return GroupMapper.toResponse(restored);
  }

  // ------------------------------------------------------------------
  // HARD DELETE
  // ------------------------------------------------------------------
  async hardDelete(id: string) {
    const existing = await this.repo.findByIdAny(id);
    if (!existing) throw new NotFoundException(`Group ${id} introuvable.`);

    await this.repo.hardDelete(id);
    this.logger.warn(`Group SUPPRIMÉ DÉFINITIVEMENT : ${id}`);
    return { success: true };
  }
}
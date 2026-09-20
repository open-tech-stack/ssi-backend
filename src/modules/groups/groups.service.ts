// src/modules/groups/groups.service.ts
import {
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

  async findAll(query: QueryGroupsDto) {
    const skip = (query.page - 1) * query.pageSize;
    const { items, total } = await this.repo.findMany({
      q: query.q,
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

  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Group ${id} introuvable.`);

    await this.repo.softDelete(id);
    return { success: true };
  }
}
// src/modules/users/users.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { UserRole } from '../../generated/prisma/client.js';

import type { CreateUserDto } from './dto/create-user.dto.js';
import type { QueryUsersDto } from './dto/query-users.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { UserMapper } from './mappers/user.mapper.js';
import { UsersRepository } from './repositories/users.repository.js';
import { generateCode } from './utils/code-generator.js';

/**
 * Service Users.
 *
 *    (liste, détail, création) — c'est nécessaire pour
 *
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly repo: UsersRepository) {}

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  async create(dto: CreateUserDto) {
    // 1) Un MEMBRE doit obligatoirement avoir une Person
    if (dto.role === UserRole.MEMBRE && !dto.personId) {
      throw new BadRequestException(
        'Un utilisateur MEMBRE doit être lié à une Person (personId).',
      );
    }

    // 2) Pas deux users pour la même Person
    if (dto.personId) {
      const already = await this.repo.existsByPersonId(dto.personId);
      if (already) {
        throw new ConflictException(
          'Un utilisateur est déjà lié à cette Person.',
        );
      }
    }

    const code = await this.generateUniqueCode();

    // 4) Création
    const user = await this.repo.create({
      code,
      role: dto.role,
      person: dto.personId
        ? { connect: { id: dto.personId } }
        : undefined,
    });

    // 🔒 Log masqué : on ne journalise JAMAIS le code en clair
    this.logger.log(`User créé : ${user.id} (${user.role})`);

    // ✅ Le code est renvoyé (mapper standard) — admin seulement
    return UserMapper.toResponse(user);
  }

  async registerPushToken(userId: string, expoPushToken: string) {
    await this.repo.update(userId, { expoPushToken });
    return { success: true };
  }

  async unregisterPushToken(userId: string) {
    await this.repo.update(userId, { expoPushToken: null });
    return { success: true };
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async findAll(query: QueryUsersDto) {
    const skip = (query.page - 1) * query.pageSize;

    const { items, total } = await this.repo.findMany({
      role: query.role,
      codeContains: query.code,
      skip,
      take: query.pageSize,
    });

    return {
      items: UserMapper.toResponseList(items),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} introuvable.`);
    return UserMapper.toResponse(user);
  }

  // ------------------------------------------------------------------
  // UPDATE
  // ------------------------------------------------------------------
  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} introuvable.`);

    // Si on change le rôle en MEMBRE, il faut une Person
    const nextRole = dto.role ?? existing.role;
    const nextPersonId = dto.personId ?? existing.personId;

    if (nextRole === UserRole.MEMBRE && !nextPersonId) {
      throw new BadRequestException(
        'Un utilisateur MEMBRE doit être lié à une Person (personId).',
      );
    }

    // Vérif si on change la Person liée
    if (dto.personId && dto.personId !== existing.personId) {
      const already = await this.repo.existsByPersonId(dto.personId);
      if (already) {
        throw new ConflictException(
          'Un utilisateur est déjà lié à cette Person.',
        );
      }
    }

    const updated = await this.repo.update(id, {
      role: dto.role,
      person: dto.personId
        ? { connect: { id: dto.personId } }
        : undefined,
    });

    return UserMapper.toResponse(updated);
  }

  // ------------------------------------------------------------------
  // DELETE (soft)
  // ------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`User ${id} introuvable.`);

    await this.repo.softDelete(id);
    return { success: true };
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  private async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = generateCode();
      const exists = await this.repo.existsByCode(code);
      if (!exists) return code;
    }
    throw new Error(
      "Impossible de générer un code unique après 5 tentatives — contactez l'admin.",
    );
  }
}
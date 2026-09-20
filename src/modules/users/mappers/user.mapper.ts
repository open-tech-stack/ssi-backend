// src/modules/users/mappers/user.mapper.ts
import type { User } from '../../../generated/prisma/client.js';
import type { UserResponse } from '../types/user-response.type.js';

/**
 * Mapper User → UserResponse.
 *
 * Transforme l'entité Prisma en objet exposable par l'API.
 * Ne laisse JAMAIS fuiter `refreshTokenHash` ou `deletedAt`.
 */
export class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      code: user.code,
      role: user.role,
      personId: user.personId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toResponseList(users: User[]): UserResponse[] {
    return users.map((u) => UserMapper.toResponse(u));
  }
}
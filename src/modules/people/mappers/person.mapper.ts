// src/modules/people/mappers/person.mapper.ts
import type { Person } from '../../../generated/prisma/client.js';
import type {
  PersonPublicResponse,
  PersonResponse,
} from '../types/person-response.type.js';

export class PersonMapper {
  static toResponse(p: Person): PersonResponse {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      fullName: p.fullName,
      role: p.role,
      avatar: p.avatar,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt?.toISOString() ?? null,
      isDeleted: p.deletedAt !== null,
    };
  }

  static toResponseList(people: Person[]): PersonResponse[] {
    return people.map((p) => PersonMapper.toResponse(p));
  }

  static toPublic(p: Person): PersonPublicResponse {
    return { id: p.id, fullName: p.fullName };
  }

  static toPublicList(people: Person[]): PersonPublicResponse[] {
    return people.map((p) => PersonMapper.toPublic(p));
  }
}
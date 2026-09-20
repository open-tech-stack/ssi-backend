// src/modules/groups/mappers/group.mapper.ts
import type { Group } from '../../../generated/prisma/client.js';
import type { GroupResponse } from '../types/group-response.type.js';

export class GroupMapper {
  static toResponse(g: Group): GroupResponse {
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    };
  }

  static toResponseList(groups: Group[]): GroupResponse[] {
    return groups.map((g) => GroupMapper.toResponse(g));
  }
}
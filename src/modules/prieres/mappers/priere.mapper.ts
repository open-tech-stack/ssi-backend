// src/modules/prieres/mappers/priere.mapper.ts
import type { Priere } from '../../../generated/prisma/client.js';

import type { PriereResponse } from '../types/priere-response.type.js';

export class PriereMapper {
  static toResponse(p: Priere): PriereResponse {
    return {
      id: p.id,
      title: p.title,
      date: p.date?.toISOString() ?? null,
      location: p.location,
      detail: p.detail,
      priority: p.priority,
      notification: p.notification,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  static toResponseList(items: Priere[]): PriereResponse[] {
    return items.map((p) => PriereMapper.toResponse(p));
  }
}
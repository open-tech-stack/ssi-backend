// src/modules/infos/mappers/info.mapper.ts
import type { Info } from '../../../generated/prisma/client.js';

import type { InfoResponse } from '../types/info-response.type.js';

export class InfoMapper {
  static toResponse(i: Info): InfoResponse {
    return {
      id: i.id,
      title: i.title,
      summary: i.summary,
      detail: i.detail,
      priority: i.priority,
      notification: i.notification,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    };
  }

  static toResponseList(items: Info[]): InfoResponse[] {
    return items.map((i) => InfoMapper.toResponse(i));
  }
}
// src/modules/rappels/mappers/rappel.mapper.ts
import type { Prisma } from '../../../generated/prisma/client.js';

import type {
  RappelElementResponse,
  RappelResponse,
} from '../types/rappel-response.type.js';

export type RappelWithElements = Prisma.RappelGetPayload<{
  include: { elements: true };
}>;

export class RappelMapper {
  static toResponse(r: RappelWithElements): RappelResponse {
    const sortedElements = [...r.elements].sort((a, b) => a.order - b.order);

    const elements: RappelElementResponse[] = sortedElements.map((el) => ({
      id: el.id,
      text: el.text,
      order: el.order,
    }));

    return {
      id: r.id,
      title: r.title,
      detail: r.detail,
      priority: r.priority,
      notification: r.notification,
      elements,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  static toResponseList(items: RappelWithElements[]): RappelResponse[] {
    return items.map((r) => RappelMapper.toResponse(r));
  }
}
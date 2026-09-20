// src/modules/evenements/mappers/evenement.mapper.ts
import type { Evenement } from '../../../generated/prisma/client.js';
import { computeStatus } from '../../programmes/utils/computed-status.js';

import type { EvenementResponse } from '../types/evenement-response.type.js';

export class EvenementMapper {
  static toResponse(e: Evenement): EvenementResponse {
    return {
      id: e.id,
      kind: e.kind,
      title: e.title,
      summary: e.summary,
      detail: e.detail,
      priority: e.priority,
      status: computeStatus({
        status: e.status,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
      }),
      rawStatus: e.status,
      location: e.location,

      startsAt: e.startsAt?.toISOString() ?? null,
      endsAt: e.endsAt?.toISOString() ?? null,
      expiresAt: e.expiresAt?.toISOString() ?? null,
      publishedAt: e.publishedAt?.toISOString() ?? null,

      notification: e.notification,

      brideName: e.brideName,
      groomName: e.groomName,
      townHallTime: e.townHallTime,
      townHallPlace: e.townHallPlace,
      ceremonyTime: e.ceremonyTime,
      ceremonyPlace: e.ceremonyPlace,
      receptionPlace: e.receptionPlace,

      audience: e.audience,
      audienceOther: e.audienceOther,
      theme: e.theme,

      speaker: e.speaker,
      trainer: e.trainer,

      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }

  static toResponseList(items: Evenement[]): EvenementResponse[] {
    return items.map((e) => EvenementMapper.toResponse(e));
  }
}
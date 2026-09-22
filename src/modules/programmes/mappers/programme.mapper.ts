// src/modules/programmes/mappers/programme.mapper.ts
import type { Prisma } from '../../../generated/prisma/client.js';

import { computeStatus } from '../utils/computed-status.js';
import type {
  ProgrammeResponse,
  ProgrammeSectionResponse,
} from '../types/programme-response.type.js';

/**
 * Type Prisma incluant sections + personnes + groupe.
 */
export type ProgrammeWithRelations = Prisma.ProgrammeGetPayload<{
  include: {
    sections: {
      include: {
        persons: {
          include: {
            person: true;
          };
        };
        group: true;
      };
    };
  };
}>;

export class ProgrammeMapper {
  static toResponse(p: ProgrammeWithRelations): ProgrammeResponse {
    // On trie les sections par ordre d'affichage
    const sortedSections = [...p.sections].sort((a, b) => a.order - b.order);

    const sections: ProgrammeSectionResponse[] = sortedSections.map((s) => ({
      id: s.id,
      key: s.key,
      label: s.label,
      order: s.order,
      value: s.value,
      persons: s.persons.map((sp) => ({
        id: sp.person.id,
        fullName: sp.person.fullName,
      })),
      group: s.group ? { id: s.group.id, name: s.group.name } : null,
    }));

    const computedStatus = computeStatus(p);

    return {
      id: p.id,
      kind: p.kind,
      title: p.title,
      summary: p.summary,
      content: p.content,
      priority: p.priority,
      status: computedStatus,
      rawStatus: p.status,
      location: p.location,
      hasHolyCommunion: p.hasHolyCommunion,
      holyCommunionMessage: p.holyCommunionMessage,
      notes: p.notes,
      startsAt: p.startsAt?.toISOString() ?? null,
      endsAt: p.endsAt?.toISOString() ?? null,
      expiresAt: p.expiresAt?.toISOString() ?? null,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      notification: p.notification,
      sections,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt?.toISOString() ?? null,
      isDeleted: p.deletedAt !== null,
    };
  }

  static toResponseList(items: ProgrammeWithRelations[]): ProgrammeResponse[] {
    return items.map((p) => ProgrammeMapper.toResponse(p));
  }
}
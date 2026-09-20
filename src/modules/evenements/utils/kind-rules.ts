// src/modules/evenements/utils/kind-rules.ts
import { BadRequestException } from '@nestjs/common';

import type { EvenementKind } from '../../../generated/prisma/client.js';

/**
 * Champs obligatoires par type d'événement.
 *
 * On valide ça côté service (pas dans le DTO) car les règles dépendent
 * du `kind`, ce que class-validator ne sait pas faire élégamment.
 */
export interface EvenementKindFields {
  brideName?: string | null;
  groomName?: string | null;
  ceremonyPlace?: string | null;
  audience?: string | null;
  theme?: string | null;
  speaker?: string | null;
  trainer?: string | null;
}

/**
 * Vérifie que les champs obligatoires sont présents pour un kind donné.
 * Lève BadRequestException sinon.
 */
export function assertKindRequirements(
  kind: EvenementKind,
  fields: EvenementKindFields,
): void {
  const missing: string[] = [];

  switch (kind) {
    case 'MARIAGE':
      if (!fields.groomName?.trim()) missing.push('groomName');
      if (!fields.brideName?.trim()) missing.push('brideName');
      break;

    case 'CAMP':
    case 'SORTIE':
      if (!fields.audience) missing.push('audience');
      if (!fields.theme?.trim()) missing.push('theme');
      break;

    case 'CONFERENCE':
      if (!fields.speaker?.trim()) missing.push('speaker');
      if (!fields.theme?.trim()) missing.push('theme');
      break;

    case 'FORMATION':
      if (!fields.trainer?.trim()) missing.push('trainer');
      break;

    case 'JOURNEE':
      if (!fields.audience) missing.push('audience');
      break;

    case 'ACTION_DE_GRACE':
    case 'AUTRE':
      // Aucun champ spécifique obligatoire
      break;
  }

  if (missing.length > 0) {
    throw new BadRequestException(
      `Champs obligatoires manquants pour un événement de type « ${kind} » : ${missing.join(', ')}.`,
    );
  }
}

/**
 * Nettoie les champs non pertinents pour un kind donné.
 * Ex : un MARIAGE ne doit pas avoir de `trainer`, etc.
 * On met `null` partout où ce n'est pas applicable.
 */
export function sanitizeFieldsForKind<
  T extends {
    kind: EvenementKind;
    brideName?: string | null;
    groomName?: string | null;
    townHallTime?: string | null;
    townHallPlace?: string | null;
    ceremonyTime?: string | null;
    ceremonyPlace?: string | null;
    receptionPlace?: string | null;
    audience?: string | null;
    audienceOther?: string | null;
    theme?: string | null;
    speaker?: string | null;
    trainer?: string | null;
  },
>(input: T): T {
  const out: T = { ...input };

  const mariageFields = [
    'brideName',
    'groomName',
    'townHallTime',
    'townHallPlace',
    'ceremonyTime',
    'ceremonyPlace',
    'receptionPlace',
  ] as const;

  const audienceFields = ['audience', 'audienceOther', 'theme'] as const;
  const speakerFields = ['speaker', 'theme'] as const;
  const trainerFields = ['trainer'] as const;

  const clearAll = () => {
    mariageFields.forEach((f) => ((out as any)[f] = null));
    audienceFields.forEach((f) => ((out as any)[f] = null));
    speakerFields.forEach((f) => ((out as any)[f] = null));
    trainerFields.forEach((f) => ((out as any)[f] = null));
  };

  switch (out.kind) {
    case 'MARIAGE':
      // Garde les champs mariage, efface le reste
      audienceFields.forEach((f) => ((out as any)[f] = null));
      speakerFields.forEach((f) => ((out as any)[f] = null));
      trainerFields.forEach((f) => ((out as any)[f] = null));
      break;

    case 'CAMP':
    case 'SORTIE':
      // Garde audience + theme, efface le reste
      mariageFields.forEach((f) => ((out as any)[f] = null));
      speakerFields.forEach((f) => ((out as any)[f] = null));
      trainerFields.forEach((f) => ((out as any)[f] = null));
      break;

    case 'CONFERENCE':
      // Garde speaker + theme, efface le reste
      mariageFields.forEach((f) => ((out as any)[f] = null));
      audienceFields.forEach((f) => ((out as any)[f] = null));
      trainerFields.forEach((f) => ((out as any)[f] = null));
      break;

    case 'FORMATION':
      // Garde trainer, efface le reste
      mariageFields.forEach((f) => ((out as any)[f] = null));
      audienceFields.forEach((f) => ((out as any)[f] = null));
      speakerFields.forEach((f) => ((out as any)[f] = null));
      break;

    case 'ACTION_DE_GRACE':
    case 'AUTRE':
    case 'JOURNEE':
    default:
      if (out.kind === 'JOURNEE') {
        // Garde audience
        mariageFields.forEach((f) => ((out as any)[f] = null));
        speakerFields.forEach((f) => ((out as any)[f] = null));
        trainerFields.forEach((f) => ((out as any)[f] = null));
        (out as any).audienceOther = input.audienceOther ?? null;
      } else {
        // ACTION_DE_GRACE / AUTRE : rien de spécifique
        clearAll();
      }
      break;
  }

  return out;
}
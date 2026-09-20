// src/modules/programmes/utils/computed-status.ts
import type { InfoStatus, Programme } from '../../../generated/prisma/client.js';

/**
 * Calcule le statut réel d'un programme à partir de ses dates.
 *
 * Règles :
 *  - now < startsAt              → A_VENIR
 *  - startsAt <= now <= endsAt   → EN_COURS
 *  - now > endsAt                → TERMINE
 *
 * Cas particulier :
 *  - Si le statut en base est ANNULE ou EXPIRE, on le garde tel quel.
 *  - Si endsAt absent, on suppose une durée par défaut de 2h.
 */
export function computeStatus(
  p: Pick<Programme, 'status' | 'startsAt' | 'endsAt'>,
  now: Date = new Date(),
): InfoStatus {
  // Statuts manuels prioritaires
  if (p.status === 'ANNULE' || p.status === 'EXPIRE') {
    return p.status;
  }

  if (!p.startsAt) return p.status;

  const start = p.startsAt.getTime();
  const end = p.endsAt
    ? p.endsAt.getTime()
    : start + 2 * 60 * 60 * 1000;

  const t = now.getTime();

  if (t < start) return 'A_VENIR';
  if (t <= end) return 'EN_COURS';
  return 'TERMINE';
}
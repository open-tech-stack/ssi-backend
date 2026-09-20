// src/modules/users/utils/code-generator.ts
import { randomInt } from 'node:crypto';

/**
 * Génère un code à 10 caractères alphanumériques majuscules.
 *
 * - Alphabet : A-Z (sans I, O) + 2-9
 *   → on retire I, O, 0, 1 pour éviter les confusions visuelles
 *   quand l'utilisateur tape son code.
 * - 32 caractères possibles → 32^10 ≈ 1.1 × 10^15 combinaisons
 *   → aucune collision réaliste.
 *
 * Le code généré est purement cryptographique (randomInt de node:crypto).
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 caractères
const CODE_LENGTH = 10;

export function generateCode(): string {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}
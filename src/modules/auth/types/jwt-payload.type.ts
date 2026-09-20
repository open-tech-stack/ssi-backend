// src/modules/auth/types/jwt-payload.type.ts
import type { UserRole } from '../../../generated/prisma/client.js';

/**
 * Payload contenu dans un access token JWT.
 * Volontairement minimal : pas de données sensibles.
 */
export interface JwtPayload {
  /** Id de l'utilisateur */
  sub: string;
  /** Rôle (utile pour le RolesGuard) */
  role: UserRole;
  /** Type de token — permet de distinguer access vs refresh */
  type: 'access' | 'refresh';
}
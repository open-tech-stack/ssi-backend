// src/modules/auth/utils/auth-cookies.ts
import type { Response } from 'express';

export const ACCESS_COOKIE = 'ssi.accessToken';
export const REFRESH_COOKIE = 'ssi.refreshToken';
export const USER_COOKIE = 'ssi.user';

const REFRESH_PATH = '/api/auth';

/**
 * Pose les 3 cookies d'auth dans la réponse HTTP.
 *
 * - accessToken : httpOnly, 15 min, path=/
 * - refreshToken : httpOnly, 7 jours, path=/api/auth (limité !)
 * - user : NON httpOnly (le front doit pouvoir lire le nom pour l'UI),
 *          mais sans tokens dedans → safe
 */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  user: unknown,
  isProd: boolean,
) {
  const base = {
    httpOnly: true as const,
    secure: isProd, // HTTPS uniquement en prod
    sameSite: 'lax' as const,
  };

  // Access : 15 minutes
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh : 7 jours, limité au path /api/auth/refresh
  // (le navigateur ne l'enverra JAMAIS à une autre route)
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    sameSite: 'strict', // 🔒 anti-CSRF renforcé
    path: REFRESH_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // User : lisible par le front pour l'UI, PAS de token dedans
  res.cookie(USER_COOKIE, JSON.stringify(user), {
    httpOnly: false, // ✅ expressément lisible côté JS
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_PATH });
  res.clearCookie(USER_COOKIE, { path: '/' });
}
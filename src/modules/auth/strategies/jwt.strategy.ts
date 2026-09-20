// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AppConfig } from '../../../config/configuration.js';
import type { JwtPayload } from '../types/jwt-payload.type.js';

/**
 * Stratégie JWT — vérifie l'access token et injecte le payload dans req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<AppConfig, true>) {
    const secret = config.get('jwt.accessSecret', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Retourne le contenu qui sera injecté dans `request.user`.
   * On rejette les refresh tokens (ils ne doivent pas servir d'access).
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Type de token invalide.');
    }
    return payload;
  }
}
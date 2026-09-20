// src/modules/auth/auth.service.ts
import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { AppConfig } from '../../config/configuration.js';
import type { User } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsersRepository, UserWithPerson } from '../users/repositories/users.repository.js';

import type { JwtPayload } from './types/jwt-payload.type.js';

/**
 * Service Auth.
 *
 * - login(code) : vérifie le code, génère access + refresh tokens,
 *                 stocke le hash du refresh dans User.refreshTokenHash.
 * - refresh(refreshToken) : vérifie le refresh, en génère un nouveau couple.
 * - logout(userId) : efface le hash.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // ------------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------------
  async login(code: string) {
    const user = await this.usersRepo.findByCode(code);
    if (!user) {
      // On ne dit JAMAIS si le code existe ou pas
      throw new UnauthorizedException('Code invalide.');
    }

    const tokens = await this.issueTokens(user);

    this.logger.log(`Login réussi : ${user.id} (${user.role})`);
    return tokens;
  }

  // ------------------------------------------------------------------
  // REFRESH
  // ------------------------------------------------------------------
  async refresh(refreshToken: string) {
    // 1) Vérifier la signature et le type
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get('jwt.refreshSecret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Type de token invalide.');
    }

    // 2) Retrouver l'utilisateur
    const user = await this.usersRepo.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session expirée.');
    }

    // 3) Vérifier que le refresh fourni correspond au hash stocké
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Session révoquée.');
    }

    // 4) Nouveaux tokens (rotation)
    const tokens = await this.issueTokens(user);
    return tokens;
  }

  // ------------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------------
  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
    return { success: true };
  }

  // ------------------------------------------------------------------
  // ME
  // ------------------------------------------------------------------
  async me(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      code: user.code,
      role: user.role,
      personId: user.personId,
      fullName: user.person?.fullName ?? null,
    };
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  private async issueTokens(user: UserWithPerson) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.get('jwt.accessSecret', { infer: true }),
        expiresIn: this.config.get('jwt.accessExpiresIn', { infer: true }),
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.get('jwt.refreshSecret', { infer: true }),
        expiresIn: this.config.get('jwt.refreshExpiresIn', { infer: true }),
      }),
    ]);

    // Stocke le hash du refresh token (jamais en clair)
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(user.id, { refreshTokenHash: hash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        code: user.code,
        role: user.role,
        personId: user.personId,
        fullName: user.person?.fullName ?? null, 
      },
    };
  }
}
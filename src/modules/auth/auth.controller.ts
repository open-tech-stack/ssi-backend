// src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import type { AppConfig } from '../../config/configuration.js';

import { AuthService } from './auth.service.js';
import { LoginDto, RefreshDto } from './dto/index.js';
import type { JwtPayload } from './types/jwt-payload.type.js';
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from './utils/auth-cookies.js';

/**
 * Type du header X-Client envoyé par les apps clientes.
 *  - 'web'    → dashboard Next.js (cookies httpOnly)
 *  - 'mobile' → app React Native / Flutter (tokens dans le body)
 *  - absent   → on considère mobile par défaut (compatibilité)
 */
const CLIENT_HEADER = 'x-client';
const CLIENT_WEB = 'web';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private get isProd() {
    return this.config.get('app.env', { infer: true }) === 'production';
  }

  /**
   * Détecte si la requête vient du web (cookies) ou du mobile (body).
   * Header `X-Client: web` → web. Tout le reste → mobile.
   */
  private isWebClient(req: Request): boolean {
    return req.headers[CLIENT_HEADER] === CLIENT_WEB;
  }

  // ------------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------------
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Client',
    description:
      "Type de client. `web` → cookies httpOnly. Absent ou `mobile` → tokens dans le body.",
    required: false,
    enum: ['web', 'mobile'],
  })
  @ApiOperation({
    summary: 'Connexion par code à 10 caractères (web + mobile)',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto.code);

    // 🌐 WEB : on pose les cookies httpOnly, on ne renvoie QUE user
    if (this.isWebClient(req)) {
      setAuthCookies(res, { accessToken, refreshToken }, user, this.isProd);
      return { user };
    }

    // 📱 MOBILE : pas de cookies, tokens dans le body
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // ------------------------------------------------------------------
  // REFRESH
  // ------------------------------------------------------------------
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Client',
    description:
      "Type de client. `web` → le refreshToken vient du cookie. Absent ou `mobile` → le refreshToken vient du body.",
    required: false,
    enum: ['web', 'mobile'],
  })
  @ApiOperation({ summary: 'Rafraîchir les tokens (web + mobile)' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isWeb = this.isWebClient(req);

    // 📱 MOBILE : refreshToken dans le body
    // 🌐 WEB    : refreshToken dans le cookie
    // (priorité au body si présent — utile pour tester avec curl)
    const refreshToken = isWeb
      ? (req.cookies?.[REFRESH_COOKIE] as string | undefined)
      : dto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Aucun refresh token.');
    }

    const {
      accessToken,
      refreshToken: newRefresh,
      user,
    } = await this.authService.refresh(refreshToken);

    // 🌐 WEB : nouveau couple dans les cookies
    if (isWeb) {
      setAuthCookies(
        res,
        { accessToken, refreshToken: newRefresh },
        user,
        this.isProd,
      );
      return { user };
    }

    // 📱 MOBILE : nouveau couple dans le body
    return {
      accessToken,
      refreshToken: newRefresh,
      user,
    };
  }

  // ------------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------------
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'X-Client',
    description:
      "`web` → efface les cookies httpOnly. Absent ou `mobile` → ne fait rien côté réponse (le mobile vide son stockage).",
    required: false,
    enum: ['web', 'mobile'],
  })
  @ApiOperation({ summary: 'Se déconnecter (révoque le refresh)' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);

    // 🌐 WEB : on efface les cookies
    if (this.isWebClient(req)) {
      clearAuthCookies(res);
    }

    return { success: true };
  }

  // ------------------------------------------------------------------
  // ME
  // ------------------------------------------------------------------
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil de l’utilisateur connecté' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}
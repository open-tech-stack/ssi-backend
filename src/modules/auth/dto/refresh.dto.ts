// src/modules/auth/dto/refresh.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO de rafraîchissement de token.
 *
 * ⚠️ Le `refreshToken` est OPTIONNEL :
 *  - 🌐 Web    → le refreshToken vient du cookie httpOnly
 *  - 📱 Mobile → le refreshToken vient du body
 *
 * Le controller choisit la source selon le header X-Client.
 */
export class RefreshDto {
  @ApiPropertyOptional({
    description:
      'Refresh token JWT (mobile uniquement — le web utilise un cookie httpOnly).',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  refreshToken?: string;
}
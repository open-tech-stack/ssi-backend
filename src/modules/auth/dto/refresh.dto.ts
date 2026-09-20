// src/modules/auth/dto/refresh.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO de rafraîchissement de token.
 */
export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token JWT émis lors du login',
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
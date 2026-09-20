// src/modules/users/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { UserRole } from '../../../generated/prisma/client.js';

/**
 * DTO de création d'un utilisateur.
 *
 * - Le `code` est généré automatiquement côté serveur.
 * - Un user MEMBRE doit obligatoirement avoir un `personId`.
 * - Un user ADMIN peut ne pas en avoir.
 */
export class CreateUserDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Rôle du nouvel utilisateur',
    example: UserRole.MEMBRE,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({
    description:
      "Identifiant de la Person liée. Obligatoire pour un user MEMBRE, optionnel pour un ADMIN.",
    example: 'clx123abc',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  personId?: string;
}
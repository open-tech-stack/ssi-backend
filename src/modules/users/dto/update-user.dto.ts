// src/modules/users/dto/update-user.dto.ts
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateUserDto } from './create-user.dto.js';

/**
 * DTO de mise à jour d'un user.
 * Tous les champs sont optionnels (PartialType).
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Marquer le compte comme actif/inactif',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
// src/modules/users/types/user-response.type.ts
import { ApiProperty } from '@nestjs/swagger';

import type { UserRole } from '../../../generated/prisma/client.js';

/**
 * Forme de la réponse d'un user renvoyée par l'API.
 * On n'expose JAMAIS le `refreshTokenHash` ni autres champs sensibles.
 */
export class UserResponse {
  @ApiProperty({ example: 'clx123abc' })
  id!: string;

  @ApiProperty({ example: 'A7K2P9M4X1' })
  code!: string;

  @ApiProperty({ enum: ['ADMIN', 'MEMBRE'], example: 'MEMBRE' })
  role!: UserRole;

  @ApiProperty({ example: 'clx987person', nullable: true })
  personId!: string | null;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  updatedAt!: string;
}
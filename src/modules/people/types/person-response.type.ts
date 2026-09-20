// src/modules/people/types/person-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonResponse {
  @ApiProperty({ example: 'clx123' })
  id!: string;

  @ApiProperty({ example: 'Ali' })
  firstName!: string;

  @ApiPropertyOptional({ example: 'Diallo', nullable: true })
  lastName?: string | null;

  @ApiProperty({ example: 'Ali Diallo' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'Diacre', nullable: true })
  role?: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatar?: string | null;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  updatedAt!: string;
}

/**
 * Version "publique" minimale — utile pour le mobile
 * (afficher qui est au programme sans exposer d'infos sensibles).
 */
export class PersonPublicResponse {
  @ApiProperty({ example: 'clx123' })
  id!: string;

  @ApiProperty({ example: 'Ali Diallo' })
  fullName!: string;
}
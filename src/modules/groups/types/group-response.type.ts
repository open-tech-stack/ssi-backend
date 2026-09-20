// src/modules/groups/types/group-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupResponse {
  @ApiProperty({ example: 'clx123' })
  id!: string;

  @ApiProperty({ example: 'Groupe musical' })
  name!: string;

  @ApiPropertyOptional({ example: 'Chorale…', nullable: true })
  description?: string | null;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-16T12:00:00.000Z' })
  updatedAt!: string;
}
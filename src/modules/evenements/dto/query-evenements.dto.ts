// src/modules/evenements/dto/query-evenements.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  EvenementKind,
  InfoStatus,
} from '../../../generated/prisma/client.js';

export type PeriodFilter = 'upcoming' | 'past' | 'all';
export type DeletedFilter = 'active' | 'deleted' | 'all';

export class QueryEvenementsDto {
  @ApiPropertyOptional({ enum: EvenementKind })
  @IsOptional()
  @IsEnum(EvenementKind)
  kind?: EvenementKind;

  @ApiPropertyOptional({ enum: InfoStatus })
  @IsOptional()
  @IsEnum(InfoStatus)
  status?: InfoStatus;

  @ApiPropertyOptional({
    description: 'Recherche sur titre, résumé, lieu',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: ['upcoming', 'past', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['upcoming', 'past', 'all'])
  period: PeriodFilter = 'all';

  /**
   * Filtre sur les supprimés (soft delete).
   *  - active  : par défaut, seuls les non-supprimés
   *  - deleted : uniquement les supprimés (corbeille)
   *  - all     : tout (actifs + supprimés)
   */
  @ApiPropertyOptional({
    description: 'Filtre sur les entités supprimées (soft delete)',
    enum: ['active', 'deleted', 'all'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'deleted', 'all'])
  deleted: DeletedFilter = 'active';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20;
}
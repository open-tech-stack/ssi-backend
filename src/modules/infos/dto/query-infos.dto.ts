// src/modules/infos/dto/query-infos.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { Priority } from '../../../generated/prisma/client.js';

export type DeletedFilter = 'active' | 'deleted' | 'all';

export class QueryInfosDto {
  @ApiPropertyOptional({
    description: 'Recherche sur le titre, résumé ou détail',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
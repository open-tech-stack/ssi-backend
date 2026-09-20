// src/modules/programmes/dto/query-programmes.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import {
  InfoStatus,
  ProgrammeKind,
} from '../../../generated/prisma/client.js';

export type PeriodFilter = 'upcoming' | 'past' | 'all';

export class QueryProgrammesDto {
  @ApiPropertyOptional({ enum: ProgrammeKind })
  @IsOptional()
  @IsEnum(ProgrammeKind)
  kind?: ProgrammeKind;

  @ApiPropertyOptional({ enum: InfoStatus })
  @IsOptional()
  @IsEnum(InfoStatus)
  status?: InfoStatus;

  @ApiPropertyOptional({
    description: 'Recherche sur le titre, le résumé ou le lieu',
  })
  @IsOptional()
  @IsString()
  q?: string;

 @ApiPropertyOptional({
    description: '"upcoming" = futurs uniquement',
    enum: ['upcoming', 'past', 'all'],
  })
  @IsOptional()
  @IsIn(['upcoming', 'past', 'all'])
  period?: PeriodFilter;

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
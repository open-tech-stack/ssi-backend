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
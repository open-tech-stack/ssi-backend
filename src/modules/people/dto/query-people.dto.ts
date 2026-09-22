// src/modules/people/dto/query-people.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export type DeletedFilter = 'active' | 'deleted' | 'all';

export class QueryPeopleDto {
  @ApiPropertyOptional({
    description: 'Recherche sur le nom complet (insensible à la casse)',
    example: 'Ali',
  })
  @IsOptional()
  @IsString()
  q?: string;

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

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 50;
}
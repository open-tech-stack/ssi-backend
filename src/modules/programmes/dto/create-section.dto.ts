// src/modules/programmes/dto/create-section.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ProgrammeSectionKey } from '../../../generated/prisma/client.js';

export class CreateSectionDto {
  @ApiProperty({
    enum: ProgrammeSectionKey,
    example: ProgrammeSectionKey.ACCUEIL,
  })
  @IsEnum(ProgrammeSectionKey)
  key!: ProgrammeSectionKey;

  @ApiProperty({ example: 'Accueil' })
  @IsString()
  @MaxLength(80)
  label!: string;

  @ApiPropertyOptional({
    description: 'Ids des Person assignées à cette section',
    type: [String],
    example: ['clx123', 'clx456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personIds?: string[];

  @ApiPropertyOptional({
    description: 'Id du Group assigné (au lieu de personIds)',
    example: 'clxgroup',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Valeur simple (ex : "Oui" pour Sainte-Cène)',
    example: 'Oui',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  value?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
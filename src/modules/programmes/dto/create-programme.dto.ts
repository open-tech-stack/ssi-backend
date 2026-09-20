// src/modules/programmes/dto/create-programme.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  InfoStatus,
  Priority,
  ProgrammeKind,
} from '../../../generated/prisma/client.js';

import { CreateSectionDto } from './create-section.dto.js';

export class CreateProgrammeDto {
  @ApiProperty({
    enum: ProgrammeKind,
    example: ProgrammeKind.CULTE_DIMANCHE,
  })
  @IsEnum(ProgrammeKind)
  kind!: ProgrammeKind;

  @ApiProperty({ example: 'Culte de dimanche' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Culte dominical — louange, prédication…' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  summary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    enum: Priority,
    default: Priority.NORMAL,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    enum: InfoStatus,
    default: InfoStatus.A_VENIR,
  })
  @IsOptional()
  @IsEnum(InfoStatus)
  status?: InfoStatus;

  @ApiPropertyOptional({ example: 'Temple central' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  // ---------- Sainte-Cène ----------
  @ApiPropertyOptional({
    description: 'Uniquement pour CULTE_DIMANCHE',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  hasHolyCommunion?: boolean;

  @ApiPropertyOptional({ example: 'Ce dimanche nous aurons…' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  holyCommunionMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // ---------- Dates ----------
  @ApiPropertyOptional({ example: '2026-09-20T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: '2026-09-20T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-09-20T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: '2026-09-20T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  notification?: boolean;

  // ---------- Sections ----------
  @ApiProperty({ type: [CreateSectionDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections!: CreateSectionDto[];
}
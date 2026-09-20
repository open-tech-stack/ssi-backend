// src/modules/evenements/dto/create-evenement.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  EvenementKind,
  InfoStatus,
  Priority,
  PublicCible,
} from '../../../generated/prisma/client.js';

export class CreateEvenementDto {
  @ApiProperty({ enum: EvenementKind, example: EvenementKind.MARIAGE })
  @IsEnum(EvenementKind)
  kind!: EvenementKind;

  @ApiProperty({ example: 'Mariage de Fatou et Ali' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Unis pour la vie devant Dieu…' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  summary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.NORMAL })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ enum: InfoStatus, default: InfoStatus.A_VENIR })
  @IsOptional()
  @IsEnum(InfoStatus)
  status?: InfoStatus;

  @ApiPropertyOptional({ example: 'Mairie de Kaloum + Temple central' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  // ---------- Dates ----------
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  notification?: boolean;

  // ---------- Champs MARIAGE ----------
  @ApiPropertyOptional({ example: 'Fatou Ndiaye' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  brideName?: string;

  @ApiPropertyOptional({ example: 'Ali Diallo' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  groomName?: string;

  @ApiPropertyOptional({ example: '10h00' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  townHallTime?: string;

  @ApiPropertyOptional({ example: 'Mairie de Kaloum' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  townHallPlace?: string;

  @ApiPropertyOptional({ example: '12h00' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ceremonyTime?: string;

  @ApiPropertyOptional({ example: 'Temple central' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ceremonyPlace?: string;

  @ApiPropertyOptional({ example: 'Salle Le Palmier' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  receptionPlace?: string;

  // ---------- Champs CAMP / SORTIE / JOURNEE ----------
  @ApiPropertyOptional({ enum: PublicCible })
  @IsOptional()
  @IsEnum(PublicCible)
  audience?: PublicCible;

  @ApiPropertyOptional({ example: 'Autre précision' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  audienceOther?: string;

  @ApiPropertyOptional({ example: 'Une génération qui ne recule pas' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  theme?: string;

  // ---------- Champs CONFERENCE ----------
  @ApiPropertyOptional({ example: 'Pasteur Ousmane Baldé' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  speaker?: string;

  // ---------- Champs FORMATION ----------
  @ApiPropertyOptional({ example: 'Moussa Sow' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  trainer?: string;
}
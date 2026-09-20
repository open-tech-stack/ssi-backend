// src/modules/prieres/dto/create-priere.dto.ts
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

import { Priority } from '../../../generated/prisma/client.js';

export class CreatePriereDto {
  @ApiProperty({ example: 'Prière pour la nation' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: '2026-09-18T18:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Temple central' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    example: 'Unissons-nous pour prier pour la paix…',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  detail?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.NORMAL })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Envoyer une notification push aux membres',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notification?: boolean;
}
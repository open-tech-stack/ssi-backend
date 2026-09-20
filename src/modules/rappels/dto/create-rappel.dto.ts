// src/modules/rappels/dto/create-rappel.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Priority } from '../../../generated/prisma/client.js';

import { CreateRappelElementDto } from './create-rappel-element.dto.js';

export class CreateRappelDto {
  @ApiProperty({ example: 'Rappels du culte de dimanche' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    example: "N'oubliez pas de prévenir vos voisins.",
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
    type: [CreateRappelElementDto],
    description: 'Liste des éléments à retenir (optionnels)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRappelElementDto)
  elements?: CreateRappelElementDto[];

  @ApiPropertyOptional({
    description: 'Envoyer une notification push aux membres',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notification?: boolean;
}
// src/modules/infos/dto/create-info.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Priority } from '../../../generated/prisma/client.js';

export class CreateInfoDto {
  @ApiProperty({ example: 'Répétition de la chorale déplacée' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: 'La répétition de cette semaine aura lieu vendredi à 18h00.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  summary!: string;

  @ApiPropertyOptional({
    example:
      "En raison d'une indisponibilité de la salle annexe, la répétition est déplacée…",
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
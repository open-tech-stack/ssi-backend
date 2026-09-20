// src/modules/notifications/dto/create-notification.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { NotificationType } from '../../../generated/prisma/client.js';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.PROGRAMME,
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: 'Nouveau programme publié' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Le programme de dimanche est disponible.' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;

  @ApiPropertyOptional({
    description: 'Deep link mobile, ex : /programmes/clx123',
    example: '/programmes/clx123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkTo?: string | null;

  @ApiPropertyOptional({ description: "Id de l'entité source" })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceId?: string | null;
}
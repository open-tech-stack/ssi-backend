// src/modules/notifications/dto/query-notifications.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';

import { NotificationType } from '../../../generated/prisma/client.js';

export type DeletedFilter = 'active' | 'deleted' | 'all';

export class QueryNotificationsDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Filtrer par read/unread' })
  @IsOptional()
  @Transform(({ value }) => {
    // Query string → booléen
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional({
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

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 20;
}
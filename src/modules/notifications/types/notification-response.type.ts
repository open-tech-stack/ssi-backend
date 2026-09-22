// src/modules/notifications/types/notification-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponse {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() title!: string;
  @ApiProperty() message!: string;
  @ApiPropertyOptional({ nullable: true }) linkTo?: string | null;
  @ApiPropertyOptional({ nullable: true }) sourceId?: string | null;
  @ApiProperty() read!: boolean;
  @ApiProperty() pushed!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  /** Date de soft delete (null si active) */
  @ApiPropertyOptional({ nullable: true })
  deletedAt?: string | null;

  /** Raccourci UI : true si soft-deleted */
  @ApiProperty()
  isDeleted!: boolean;
}
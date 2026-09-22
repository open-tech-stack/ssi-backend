// src/modules/rappels/types/rappel-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RappelElementResponse {
  @ApiProperty() id!: string;
  @ApiProperty() text!: string;
  @ApiProperty() order!: number;
}

export class RappelResponse {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) detail?: string | null;
  @ApiProperty() priority!: string;
  @ApiProperty() notification!: boolean;
  @ApiProperty({ type: [RappelElementResponse] })
  elements!: RappelElementResponse[];
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  /** Date de soft delete (null si actif) */
  @ApiPropertyOptional({ nullable: true })
  deletedAt?: string | null;

  /** Raccourci UI : true si soft-deleted */
  @ApiProperty()
  isDeleted!: boolean;
}
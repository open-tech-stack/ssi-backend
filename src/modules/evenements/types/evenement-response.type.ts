// src/modules/evenements/types/evenement-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvenementResponse {
  @ApiProperty() id!: string;
  @ApiProperty() kind!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiPropertyOptional({ nullable: true }) detail?: string | null;
  @ApiProperty() priority!: string;
  @ApiProperty({ description: 'Statut calculé' }) status!: string;
  @ApiProperty({ description: 'Statut brut en base' }) rawStatus!: string;
  @ApiPropertyOptional({ nullable: true }) location?: string | null;

  @ApiPropertyOptional({ nullable: true }) startsAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) publishedAt?: string | null;

  @ApiProperty() notification!: boolean;

  // MARIAGE
  @ApiPropertyOptional({ nullable: true }) brideName?: string | null;
  @ApiPropertyOptional({ nullable: true }) groomName?: string | null;
  @ApiPropertyOptional({ nullable: true }) townHallTime?: string | null;
  @ApiPropertyOptional({ nullable: true }) townHallPlace?: string | null;
  @ApiPropertyOptional({ nullable: true }) ceremonyTime?: string | null;
  @ApiPropertyOptional({ nullable: true }) ceremonyPlace?: string | null;
  @ApiPropertyOptional({ nullable: true }) receptionPlace?: string | null;

  // CAMP / SORTIE / JOURNEE
  @ApiPropertyOptional({ nullable: true }) audience?: string | null;
  @ApiPropertyOptional({ nullable: true }) audienceOther?: string | null;
  @ApiPropertyOptional({ nullable: true }) theme?: string | null;

  // CONFERENCE
  @ApiPropertyOptional({ nullable: true }) speaker?: string | null;

  // FORMATION
  @ApiPropertyOptional({ nullable: true }) trainer?: string | null;

  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  /** Date de soft delete (null si actif) */
  @ApiPropertyOptional({ nullable: true })
  deletedAt?: string | null;

  /** Raccourci UI : true si soft-deleted */
  @ApiProperty()
  isDeleted!: boolean;
}
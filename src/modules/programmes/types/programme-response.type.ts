// src/modules/programmes/types/programme-response.type.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProgrammePersonRef {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
}

export class ProgrammeGroupRef {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class ProgrammeSectionResponse {
  @ApiProperty() id!: string;
  @ApiProperty() key!: string;
  @ApiProperty() label!: string;
  @ApiProperty() order!: number;
  @ApiPropertyOptional({ nullable: true }) value?: string | null;
  @ApiProperty({ type: [ProgrammePersonRef] })
  persons!: ProgrammePersonRef[];
  @ApiPropertyOptional({ type: ProgrammeGroupRef, nullable: true })
  group?: ProgrammeGroupRef | null;
}

export class ProgrammeResponse {
  @ApiProperty() id!: string;
  @ApiProperty() kind!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiPropertyOptional({ nullable: true }) content?: string | null;
  @ApiProperty() priority!: string;
  @ApiProperty({ description: 'Statut calculé (A_VENIR / EN_COURS / TERMINE)' })
  status!: string;
  @ApiProperty({ description: 'Statut brut en base' })
  rawStatus!: string;
  @ApiPropertyOptional({ nullable: true }) location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  hasHolyCommunion?: boolean | null;
  @ApiPropertyOptional({ nullable: true })
  holyCommunionMessage?: string | null;

  @ApiPropertyOptional({ nullable: true }) notes?: string | null;

  @ApiPropertyOptional({ nullable: true }) startsAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) publishedAt?: string | null;

  @ApiProperty() notification!: boolean;

  @ApiProperty({ type: [ProgrammeSectionResponse] })
  sections!: ProgrammeSectionResponse[];

  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  /** Date de soft delete (null si actif) */
  @ApiPropertyOptional({ nullable: true })
  deletedAt?: string | null;

  /** Raccourci UI : true si soft-deleted */
  @ApiProperty()
  isDeleted!: boolean;
}
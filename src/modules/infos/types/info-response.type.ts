import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InfoResponse {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiPropertyOptional({ nullable: true }) detail?: string | null;
  @ApiProperty() priority!: string;
  @ApiProperty() notification!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
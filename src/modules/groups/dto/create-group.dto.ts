// src/modules/groups/dto/create-group.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Groupe musical' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: 'Chorale et instrumentistes' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
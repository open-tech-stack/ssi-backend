// src/modules/people/dto/create-person.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ example: 'Ali' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @ApiPropertyOptional({ example: 'Diallo' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @ApiPropertyOptional({
    description:
      'Nom complet. Généré automatiquement depuis firstName + lastName si absent.',
    example: 'Ali Diallo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Diacre' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  role?: string;

  @ApiPropertyOptional({ example: 'https://…/avatar.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
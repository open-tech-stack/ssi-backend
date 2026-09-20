// src/modules/rappels/dto/create-rappel-element.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, MinLength, Min } from 'class-validator';

export class CreateRappelElementDto {
  @ApiProperty({ example: 'Apporter sa Bible et un cahier' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
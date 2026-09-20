// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

/**
 * DTO de login par code à 10 caractères.
 * Le code est alphanumérique majuscule.
 */
export class LoginDto {
  @ApiProperty({
    description: 'Code à 10 caractères fourni par le secrétariat',
    example: 'PVQ5ARK8SY',
  })
  @IsString()
  @Length(10, 10, { message: 'Le code doit contenir exactement 10 caractères.' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Le code ne doit contenir que des lettres majuscules et des chiffres.',
  })
  code!: string;
}
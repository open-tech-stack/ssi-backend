// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Environnements possibles.
 */
export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Schéma de validation des variables d'environnement.
 *
 * Toute variable NON listée ici sera ignorée (whitelist implicite).
 * Toute variable marquée obligatoire sans valeur fera planter l'app
 * au démarrage avec un message clair.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @IsOptional()
  PORT: number = 5000;

  // ---------- Database ----------
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  // ---------- JWT ----------
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: string;

  // ---------- Swagger ----------
  @IsString()
  @IsOptional()
  SWAGGER_ENABLED?: string;
}

/**
 * Fonction appelée par ConfigModule pour valider le .env.
 * Lance une erreur si une variable obligatoire manque ou est mal formée.
 */
export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`❌ Validation des variables d'environnement échouée :\n${details}`);
  }

  return validated;
}
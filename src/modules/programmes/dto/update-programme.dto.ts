// src/modules/programmes/dto/update-programme.dto.ts
import { PartialType } from '@nestjs/swagger';

import { CreateProgrammeDto } from './create-programme.dto.js';

/**
 * Mise à jour d'un programme.
 * Les sections ne sont PAS gérées via PartialType — on gère
 * leur remplacement dans un endpoint dédié ou via ce DTO complet.
 */
export class UpdateProgrammeDto extends PartialType(CreateProgrammeDto) {}
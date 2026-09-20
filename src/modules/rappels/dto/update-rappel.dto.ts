// src/modules/rappels/dto/update-rappel.dto.ts
import { PartialType } from '@nestjs/swagger';

import { CreateRappelDto } from './create-rappel.dto.js';

/**
 * Si `elements` est fourni, on REMPLACE toute la liste existante.
 * Si absent, on garde les éléments actuels.
 */
export class UpdateRappelDto extends PartialType(CreateRappelDto) {}
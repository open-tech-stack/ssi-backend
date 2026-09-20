// src/modules/evenements/dto/update-evenement.dto.ts
import { PartialType } from '@nestjs/swagger';

import { CreateEvenementDto } from './create-evenement.dto.js';

export class UpdateEvenementDto extends PartialType(CreateEvenementDto) {}
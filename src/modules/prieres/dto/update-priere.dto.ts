// src/modules/prieres/dto/update-priere.dto.ts
import { PartialType } from '@nestjs/swagger';

import { CreatePriereDto } from './create-priere.dto.js';

export class UpdatePriereDto extends PartialType(CreatePriereDto) {}
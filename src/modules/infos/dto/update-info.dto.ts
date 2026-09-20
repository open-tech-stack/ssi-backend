// src/modules/infos/dto/update-info.dto.ts
import { PartialType } from '@nestjs/swagger';

import { CreateInfoDto } from './create-info.dto.js';

export class UpdateInfoDto extends PartialType(CreateInfoDto) {}
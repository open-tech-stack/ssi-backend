// src/modules/programmes/programmes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

import {
  CreateProgrammeDto,
  QueryProgrammesDto,
  UpdateProgrammeDto,
} from './dto/index.js';
import { ProgrammesService } from './programmes.service.js';

@ApiTags('Programmes')
@ApiBearerAuth('access-token')
@Controller('programmes')
export class ProgrammesController {
  constructor(private readonly programmesService: ProgrammesService) {}

  // ------------------------------------------------------------------
  // Lecture : ADMIN + MEMBRE
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les programmes' })
  findAll(@Query() query: QueryProgrammesDto) {
    return this.programmesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un programme' })
  findOne(@Param('id') id: string) {
    return this.programmesService.findOne(id);
  }

  // ------------------------------------------------------------------
  // Écriture : ADMIN uniquement
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un programme (ADMIN)' })
  create(@Body() dto: CreateProgrammeDto) {
    return this.programmesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un programme (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateProgrammeDto) {
    return this.programmesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un programme (soft, ADMIN)' })
  remove(@Param('id') id: string) {
    return this.programmesService.remove(id);
  }
}
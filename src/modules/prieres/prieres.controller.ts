// src/modules/prieres/prieres.controller.ts
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
  CreatePriereDto,
  QueryPrieresDto,
  UpdatePriereDto,
} from './dto/index.js';
import { PrieresService } from './prieres.service.js';

@ApiTags('Prières')
@ApiBearerAuth('access-token')
@Controller('prieres')
export class PrieresController {
  constructor(private readonly prieresService: PrieresService) {}

  // ------------------------------------------------------------------
  // Lecture : ADMIN + MEMBRE
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les prières' })
  findAll(@Query() query: QueryPrieresDto) {
    return this.prieresService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une prière' })
  findOne(@Param('id') id: string) {
    return this.prieresService.findOne(id);
  }

  // ------------------------------------------------------------------
  // Écriture : ADMIN uniquement
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une prière (ADMIN)' })
  create(@Body() dto: CreatePriereDto) {
    return this.prieresService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier une prière (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdatePriereDto) {
    return this.prieresService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une prière (soft delete, ADMIN)',
  })
  remove(@Param('id') id: string) {
    return this.prieresService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restaurer une prière supprimée (ADMIN)' })
  restore(@Param('id') id: string) {
    return this.prieresService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SUPPRESSION DÉFINITIVE (ADMIN)',
    description: '⚠️ Irréversible.',
  })
  hardDelete(@Param('id') id: string) {
    return this.prieresService.hardDelete(id);
  }
}
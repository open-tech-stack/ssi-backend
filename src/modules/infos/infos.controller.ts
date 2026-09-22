// src/modules/infos/infos.controller.ts
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

import { CreateInfoDto, QueryInfosDto, UpdateInfoDto } from './dto/index.js';
import { InfosService } from './infos.service.js';

@ApiTags('Infos')
@ApiBearerAuth('access-token')
@Controller('infos')
export class InfosController {
  constructor(private readonly infosService: InfosService) {}

  // ------------------------------------------------------------------
  // Lecture : ADMIN + MEMBRE
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les infos' })
  findAll(@Query() query: QueryInfosDto) {
    return this.infosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une info' })
  findOne(@Param('id') id: string) {
    return this.infosService.findOne(id);
  }

  // ------------------------------------------------------------------
  // Écriture : ADMIN uniquement
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une info (ADMIN)' })
  create(@Body() dto: CreateInfoDto) {
    return this.infosService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier une info (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateInfoDto) {
    return this.infosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer une info (soft delete, ADMIN)',
    description:
      "L'info passe en corbeille. Restaurable via PATCH :id/restore.",
  })
  remove(@Param('id') id: string) {
    return this.infosService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restaurer une info supprimée (ADMIN)' })
  restore(@Param('id') id: string) {
    return this.infosService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SUPPRESSION DÉFINITIVE (ADMIN)',
    description: '⚠️ Irréversible.',
  })
  hardDelete(@Param('id') id: string) {
    return this.infosService.hardDelete(id);
  }
}
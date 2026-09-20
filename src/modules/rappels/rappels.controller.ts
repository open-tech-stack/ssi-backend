// src/modules/rappels/rappels.controller.ts
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
  CreateRappelDto,
  QueryRappelsDto,
  UpdateRappelDto,
} from './dto/index.js';
import { RappelsService } from './rappels.service.js';

@ApiTags('Rappels')
@ApiBearerAuth('access-token')
@Controller('rappels')
export class RappelsController {
  constructor(private readonly rappelsService: RappelsService) {}

  // ------------------------------------------------------------------
  // Lecture : ADMIN + MEMBRE
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les rappels' })
  findAll(@Query() query: QueryRappelsDto) {
    return this.rappelsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un rappel' })
  findOne(@Param('id') id: string) {
    return this.rappelsService.findOne(id);
  }

  // ------------------------------------------------------------------
  // Écriture : ADMIN uniquement
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un rappel (ADMIN)' })
  create(@Body() dto: CreateRappelDto) {
    return this.rappelsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un rappel (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateRappelDto) {
    return this.rappelsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un rappel (soft, ADMIN)' })
  remove(@Param('id') id: string) {
    return this.rappelsService.remove(id);
  }
}
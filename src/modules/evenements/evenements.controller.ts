// src/modules/evenements/evenements.controller.ts
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
  CreateEvenementDto,
  QueryEvenementsDto,
  UpdateEvenementDto,
} from './dto/index.js';
import { EvenementsService } from './evenements.service.js';

@ApiTags('Événements')
@ApiBearerAuth('access-token')
@Controller('evenements')
export class EvenementsController {
  constructor(private readonly evenementsService: EvenementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les événements' })
  findAll(@Query() query: QueryEvenementsDto) {
    return this.evenementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un événement' })
  findOne(@Param('id') id: string) {
    return this.evenementsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un événement (ADMIN)' })
  create(@Body() dto: CreateEvenementDto) {
    return this.evenementsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un événement (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateEvenementDto) {
    return this.evenementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un événement (soft, ADMIN)' })
  remove(@Param('id') id: string) {
    return this.evenementsService.remove(id);
  }
}
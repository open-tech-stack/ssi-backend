// src/modules/people/people.controller.ts
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
  CreatePersonDto,
  QueryPeopleDto,
  UpdatePersonDto,
} from './dto/index.js';
import { PeopleService } from './people.service.js';

@ApiTags('People')
@ApiBearerAuth('access-token')
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  // ------------------------------------------------------------------
  // PUBLIC (ADMIN + MEMBRE) : lecture
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({
    summary: 'Lister les personnes (ADMIN + MEMBRE)',
  })
  findAll(@Query() query: QueryPeopleDto) {
    return this.peopleService.findAll(query);
  }

  /**
   * Version minimale publique (id + fullName uniquement).
   * Idéal pour le mobile : afficher qui est au programme.
   */
  @Get('public')
  @ApiOperation({
    summary: 'Liste publique minimale (id + nom complet)',
  })
  findAllPublic(@Query() query: QueryPeopleDto) {
    return this.peopleService.findAllPublic(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une personne' })
  findOne(@Param('id') id: string) {
    return this.peopleService.findOne(id);
  }

  // ------------------------------------------------------------------
  // ADMIN : écriture
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une personne (ADMIN)' })
  create(@Body() dto: CreatePersonDto) {
    return this.peopleService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier une personne (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    return this.peopleService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une personne (soft, ADMIN)' })
  remove(@Param('id') id: string) {
    return this.peopleService.remove(id);
  }
}
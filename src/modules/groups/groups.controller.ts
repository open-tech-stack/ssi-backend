// src/modules/groups/groups.controller.ts
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
  CreateGroupDto,
  QueryGroupsDto,
  UpdateGroupDto,
} from './dto/index.js';
import { GroupsService } from './groups.service.js';

@ApiTags('Groups')
@ApiBearerAuth('access-token')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // ------------------------------------------------------------------
  // Lecture : ADMIN + MEMBRE
  // ------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Lister les groupes' })
  findAll(@Query() query: QueryGroupsDto) {
    return this.groupsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un groupe' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  // ------------------------------------------------------------------
  // Écriture : ADMIN uniquement
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un groupe (ADMIN)' })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un groupe (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer un groupe (soft delete, ADMIN)',
  })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restaurer un groupe supprimé (ADMIN)' })
  restore(@Param('id') id: string) {
    return this.groupsService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SUPPRESSION DÉFINITIVE (ADMIN)',
    description: '⚠️ Irréversible.',
  })
  hardDelete(@Param('id') id: string) {
    return this.groupsService.hardDelete(id);
  }
}
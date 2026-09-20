// src/modules/users/users.controller.ts
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../auth/types/jwt-payload.type.js';

import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto/index.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ------------------------------------------------------------------
  // Routes "me" — accessibles à TOUS les users connectés
  // ⚠️ DOIVENT être AVANT les routes :id
  // ------------------------------------------------------------------

  @Post('me/push-token')
  @ApiOperation({
    summary: "Enregistrer le token push de l'utilisateur connecté",
  })
  registerPushToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { expoPushToken: string },
  ) {
    return this.usersService.registerPushToken(user.sub, dto.expoPushToken);
  }

  @Delete('me/push-token')
  @ApiOperation({ summary: 'Supprimer le token push' })
  unregisterPushToken(@CurrentUser() user: JwtPayload) {
    return this.usersService.unregisterPushToken(user.sub);
  }

  // ------------------------------------------------------------------
  // CRUD — réservé aux ADMIN
  // ------------------------------------------------------------------

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un utilisateur (code auto-généré)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lister les utilisateurs (paginé)' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer un utilisateur par id' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer (soft) un utilisateur' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
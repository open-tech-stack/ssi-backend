// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '../../generated/prisma/client.js';

/**
 * Restreint une route à certains rôles.
 * Exemple : @Roles(UserRole.ADMIN)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
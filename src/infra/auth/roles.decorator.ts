import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../domain/login/entities/user';

/**
 * Exige que o usuário autenticado tenha um dos papéis informados.
 * Deve ser usado em conjunto com o RolesGuard e depende do JwtAuthGuard
 * (global) já ter populado req.user.
 *
 * Ex.: @Roles('ADMIN')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

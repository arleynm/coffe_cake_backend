import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../domain/login/entities/user';
import { ROLES_KEY } from './roles.decorator';

/**
 * Verifica se req.user.role está entre os papéis exigidos por @Roles().
 * Roda depois do JwtAuthGuard global (que autentica e popula req.user).
 * Rotas sem @Roles() passam direto.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const role: Role | undefined = req?.user?.role;

    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Acesso restrito ao perfil de administrador.');
    }

    return true;
  }
}

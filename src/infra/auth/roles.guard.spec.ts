import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

function makeContext(role?: string) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as any;
}

function makeReflector(required: string[] | undefined) {
  return { getAllAndOverride: jest.fn().mockReturnValue(required) } as any;
}

describe('RolesGuard', () => {
  it('libera rotas sem @Roles()', () => {
    const guard = new RolesGuard(makeReflector(undefined));
    expect(guard.canActivate(makeContext('STAFF'))).toBe(true);
  });

  it('permite quando o papel do usuário está entre os exigidos', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    expect(guard.canActivate(makeContext('ADMIN'))).toBe(true);
  });

  it('bloqueia quando o papel não está autorizado', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    expect(() => guard.canActivate(makeContext('STAFF'))).toThrow(ForbiddenException);
  });

  it('bloqueia quando não há usuário/papel', () => {
    const guard = new RolesGuard(makeReflector(['ADMIN']));
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});

import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';

const ctx = () => ({ getHandler: () => undefined, getClass: () => undefined }) as any;

describe('JwtAuthGuard', () => {
  it('libera rotas marcadas com @Public sem autenticar', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(true) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);
    expect(guard.canActivate(ctx())).toBe(true);
  });

  it('delega ao passport (super) quando a rota não é pública', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const superProto = Object.getPrototypeOf(JwtAuthGuard.prototype);
    const spy = jest.spyOn(superProto, 'canActivate').mockReturnValue('DELEGOU' as any);

    expect(guard.canActivate(ctx())).toBe('DELEGOU');
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});

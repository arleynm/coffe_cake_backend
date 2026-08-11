import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.usecase';

function makeDeps() {
  const users = { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() };
  const hasher = { hash: jest.fn().mockResolvedValue('hashed'), compare: jest.fn() };
  users.create.mockImplementation(async (d: any) => ({ id: 'u1', ...d }));
  return { users, hasher };
}

describe('RegisterUserUseCase', () => {
  it('recusa e-mail já cadastrado', async () => {
    const { users, hasher } = makeDeps();
    users.findByEmail.mockResolvedValue({ id: 'existing' });
    const uc = new RegisterUserUseCase(users as any, hasher as any);

    await expect(uc.execute({ nome: 'A', email: 'a@b.com', senha: '123456' }))
      .rejects.toBeInstanceOf(ConflictException);
    expect(users.create).not.toHaveBeenCalled();
  });

  it('cria como STAFF por padrão (menor privilégio)', async () => {
    const { users, hasher } = makeDeps();
    users.findByEmail.mockResolvedValue(null);
    const uc = new RegisterUserUseCase(users as any, hasher as any);

    const res = await uc.execute({ nome: 'A', email: 'a@b.com', senha: '123456' });

    expect(hasher.hash).toHaveBeenCalledWith('123456');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.com', senhaHash: 'hashed', role: 'STAFF' }),
    );
    expect(res.user.role).toBe('STAFF');
  });

  it('respeita o papel ADMIN quando informado', async () => {
    const { users, hasher } = makeDeps();
    users.findByEmail.mockResolvedValue(null);
    const uc = new RegisterUserUseCase(users as any, hasher as any);

    const res = await uc.execute({ nome: 'A', email: 'a@b.com', senha: '123456', role: 'ADMIN' });

    expect(users.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'ADMIN' }));
    expect(res.user.role).toBe('ADMIN');
  });
});

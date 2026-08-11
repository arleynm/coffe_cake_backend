import { BadRequestException } from '@nestjs/common';
import { SaidaUseCase } from './saida.usecase';

function makeRepo(saldo = 0) {
  return {
    getSaldo: jest.fn().mockResolvedValue(saldo),
    saida: jest.fn().mockImplementation(async (d: any) => ({ id: 'mov1', ...d })),
  };
}

const base = { insumoId: 'ins1', depositoId: 'dep1', quantidadeBase: 5 };

describe('SaidaUseCase', () => {
  it('bloqueia saída com saldo insuficiente', async () => {
    const repo = makeRepo(3);
    const uc = new SaidaUseCase(repo as any);
    await expect(uc.execute(base)).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.saida).not.toHaveBeenCalled();
  });

  it('registra a saída quando há saldo suficiente', async () => {
    const repo = makeRepo(10);
    const uc = new SaidaUseCase(repo as any);
    await uc.execute(base);
    expect(repo.saida).toHaveBeenCalledWith(expect.objectContaining({ quantidadeBase: 5 }));
  });

  it('permite saldo negativo com allowNegative', async () => {
    const repo = makeRepo(0);
    const uc = new SaidaUseCase(repo as any);
    await uc.execute({ ...base, allowNegative: true });
    expect(repo.getSaldo).not.toHaveBeenCalled();
    expect(repo.saida).toHaveBeenCalled();
  });

  it('valida campos obrigatórios e quantidade positiva', async () => {
    const repo = makeRepo(10);
    const uc = new SaidaUseCase(repo as any);
    await expect(uc.execute({ ...base, insumoId: '' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(uc.execute({ ...base, quantidadeBase: 0 })).rejects.toBeInstanceOf(BadRequestException);
  });
});

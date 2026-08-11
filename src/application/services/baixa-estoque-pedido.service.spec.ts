import { BaixaEstoquePedidoService } from './baixa-estoque-pedido.service';

type PrismaMock = {
  pedido: { findUnique: jest.Mock; update: jest.Mock };
  pedidoItem: { findMany: jest.Mock };
  deposito: { findFirst: jest.Mock };
  movimentoEstoque: { create: jest.Mock };
  $transaction: jest.Mock;
};

function makePrisma(): PrismaMock {
  return {
    pedido: { findUnique: jest.fn(), update: jest.fn() },
    pedidoItem: { findMany: jest.fn() },
    deposito: { findFirst: jest.fn() },
    movimentoEstoque: { create: jest.fn() },
    $transaction: jest.fn(async (ops: unknown[]) => ops),
  };
}

const itens = [
  { quantidade: 2, produto: { fichaTecnica: [{ insumoId: 'A', quantidade: 10 }, { insumoId: 'B', quantidade: 5 }] } },
  { quantidade: 1, produto: { fichaTecnica: [{ insumoId: 'A', quantidade: 3 }] } },
];

describe('BaixaEstoquePedidoService.ensureBaixado', () => {
  let prisma: PrismaMock;
  let service: BaixaEstoquePedidoService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new BaixaEstoquePedidoService(prisma as any);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  it('não faz nada se o pedido já foi baixado', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'p', numero: 1, estoqueBaixado: true });
    await service.ensureBaixado('p');
    expect(prisma.pedidoItem.findMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('agrega o consumo por insumo (ficha × quantidade) e cria movimentos PRODUCAO_CONSUMO', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'p', numero: 7, estoqueBaixado: false });
    prisma.pedidoItem.findMany.mockResolvedValue(itens);
    prisma.deposito.findFirst.mockResolvedValue({ id: 'dep1' });

    await service.ensureBaixado('p');

    // A = 10*2 + 3*1 = 23 ; B = 5*2 = 10
    const calls = prisma.movimentoEstoque.create.mock.calls.map((c) => c[0].data);
    const a = calls.find((d) => d.insumoId === 'A');
    const b = calls.find((d) => d.insumoId === 'B');
    expect(a.quantidadeBase).toBe(23);
    expect(b.quantidadeBase).toBe(10);
    expect(a.tipo).toBe('PRODUCAO_CONSUMO');
    expect(a.depositoId).toBe('dep1');
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estoqueBaixado: true } }),
    );
  });

  it('não registra baixa quando não há depósito ativo', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'p', numero: 7, estoqueBaixado: false });
    prisma.pedidoItem.findMany.mockResolvedValue(itens);
    prisma.deposito.findFirst.mockResolvedValue(null);

    await service.ensureBaixado('p');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.pedido.update).not.toHaveBeenCalled();
  });

  it('é best-effort: não lança se o prisma falhar', async () => {
    prisma.pedido.findUnique.mockRejectedValue(new Error('db down'));
    await expect(service.ensureBaixado('p')).resolves.toBeUndefined();
  });
});

describe('BaixaEstoquePedidoService.ensureEstornado', () => {
  let prisma: PrismaMock;
  let service: BaixaEstoquePedidoService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new BaixaEstoquePedidoService(prisma as any);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  it('não estorna se o pedido não tinha sido baixado', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'p', numero: 1, estoqueBaixado: false });
    await service.ensureEstornado('p');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('devolve ao estoque com AJUSTE_POSITIVO e limpa a flag', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'p', numero: 9, estoqueBaixado: true });
    prisma.pedidoItem.findMany.mockResolvedValue(itens);
    prisma.deposito.findFirst.mockResolvedValue({ id: 'dep1' });

    await service.ensureEstornado('p');

    const tipos = prisma.movimentoEstoque.create.mock.calls.map((c) => c[0].data.tipo);
    expect(tipos.every((t) => t === 'AJUSTE_POSITIVO')).toBe(true);
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estoqueBaixado: false } }),
    );
  });
});

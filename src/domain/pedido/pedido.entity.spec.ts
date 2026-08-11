import { Pedido, PedidoItem, PedidoItemAdicional } from './pedido.entity';

const item = (over: Partial<{ qtd: number; preco: number; adicionais: PedidoItemAdicional[] }> = {}) =>
  new PedidoItem(
    'i1',
    'p1',
    'Cappuccino',
    'M',
    over.qtd ?? 1,
    over.preco ?? 10,
    null,
    over.adicionais ?? [],
  );

const pedido = (itens: PedidoItem[], taxaEntrega = 0) =>
  new Pedido('ped1', 1, 'MESA', null, 'RECEBIDO', itens, new Date(), new Date(), null, 'LOCAL',
    null, null, null, null, null, null, null, null, null, null, taxaEntrega);

describe('PedidoItem.subtotal', () => {
  it('multiplica preço unitário pela quantidade', () => {
    expect(item({ qtd: 3, preco: 7.5 }).subtotal()).toBe(22.5);
  });

  it('arredonda para 2 casas', () => {
    expect(item({ qtd: 3, preco: 0.1 }).subtotal()).toBe(0.3);
  });
});

describe('Pedido.total', () => {
  it('soma os subtotais dos itens', () => {
    const p = pedido([item({ qtd: 2, preco: 10 }), item({ qtd: 1, preco: 5 })]);
    expect(p.total()).toBe(25);
  });

  it('inclui a taxa de entrega', () => {
    const p = pedido([item({ qtd: 1, preco: 20 })], 7.9);
    expect(p.total()).toBe(27.9);
  });

  it('é 0 (mais taxa) quando não há itens', () => {
    expect(pedido([], 0).total()).toBe(0);
  });
});

describe('Pedido.changeStatus', () => {
  it('avança na ordem RECEBIDO -> PREPARO -> PRONTO -> ENTREGUE', () => {
    const p = pedido([item()]);
    p.changeStatus('PREPARO');
    expect(p.status).toBe('PREPARO');
    p.changeStatus('PRONTO');
    expect(p.status).toBe('PRONTO');
  });

  it('rejeita transição para trás', () => {
    const p = pedido([item()]);
    p.changeStatus('PRONTO');
    expect(() => p.changeStatus('PREPARO')).toThrow('Transição de status inválida');
  });

  it('permite cancelar a qualquer momento', () => {
    const p = pedido([item()]);
    p.changeStatus('CANCELADO');
    expect(p.status).toBe('CANCELADO');
  });

  it('não muda status depois de cancelado', () => {
    const p = pedido([item()]);
    p.changeStatus('CANCELADO');
    expect(() => p.changeStatus('PREPARO')).toThrow('Pedido cancelado não muda status');
  });

  it('aplica forma de pagamento quando informada', () => {
    const p = pedido([item()]);
    p.changeStatus('PREPARO', 'PIX');
    expect(p.formaPagamento).toBe('PIX');
  });
});

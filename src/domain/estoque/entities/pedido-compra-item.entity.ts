export class PedidoCompraItem {
  constructor(
    public readonly id: string,
    public pedidoCompraId: string,
    public insumoId: string,
    public quantidadeBase: number, // na unidade base do insumo
    public custoUnitario: string,  // Decimal em string
    public depositoId: string,
    public loteCodigo?: string | null,
    public validade?: Date | null,
  ) {
    if (!pedidoCompraId) throw new Error('pedidoCompraId é obrigatório.');
    if (!insumoId) throw new Error('insumoId é obrigatório.');
    if (!depositoId) throw new Error('depositoId é obrigatório.');
    if (!(quantidadeBase > 0)) throw new Error('quantidadeBase deve ser > 0.');
    if (!/^-?\d+(\.\d+)?$/.test(custoUnitario)) {
      throw new Error('custoUnitario inválido (use string numérica, ex.: "12.50").');
    }
  }
}

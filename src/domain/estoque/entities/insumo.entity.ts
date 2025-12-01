export class Insumo {
  constructor(
    public readonly id: string,
    public nome: string,
    public unidadeBaseId: string,
    public sku?: string | null,
    public ativo: boolean = true,
    public estoqueMinimo?: number | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.nome = nome.trim();
    if (!this.nome) throw new Error('Nome do insumo é obrigatório.');
  }
}

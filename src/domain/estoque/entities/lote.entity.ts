export class Lote {
  constructor(
    public readonly id: string,
    public insumoId: string,
    public depositoId: string,
    public codigo?: string | null,
    public validade?: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!insumoId) throw new Error('insumoId é obrigatório.');
    if (!depositoId) throw new Error('depositoId é obrigatório.');
  }
}

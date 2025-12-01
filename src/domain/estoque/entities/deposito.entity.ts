export class Deposito {
  constructor(
    public readonly id: string,
    public nome: string,
    public ativo: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.nome = nome.trim();
    if (!this.nome) throw new Error('Nome do depósito é obrigatório.');
  }
}

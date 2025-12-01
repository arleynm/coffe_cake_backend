export class Unidade {
  constructor(
    public readonly id: string,
    public codigo: string,
    public nome: string,
    public fatorBase: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    this.codigo = codigo.trim();
    this.nome = nome.trim();

    if (!this.codigo) throw new Error('Código da unidade é obrigatório.');
    if (!this.nome) throw new Error('Nome da unidade é obrigatório.');
    if (!(fatorBase > 0)) throw new Error('fatorBase deve ser maior que zero.');
  }
}

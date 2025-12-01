export class CategoriaCardapioEntity {
  constructor(
    public readonly id: string,
    public nome: string,
    public slug: string,
    public ordem: number,
    public ativo: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

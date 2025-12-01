export type Tamanho = 'P' | 'M' | 'G';

export interface ProdutoTamanho {
  id: string;
  tamanho: Tamanho;
  acrescimo: number; // em reais
}

export interface ProdutoAdicional {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
}

export class Produto {
  constructor(
    public readonly id: string,
    public nome: string,
    public categoriaId: string,
    public descricao: string | null,
    public precoCusto: number | null,
    public precoVenda: number,
    public ativo: boolean,
    public exibirNoCardapio: boolean,
    public imageId: string | null,
    public imagemUrl: string | null,
    public tamanhos: ProdutoTamanho[],
    public adicionais: ProdutoAdicional[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ProdutoRepository } from '../../../domain/produto/produto.repository';
type UpdateInput = {
  id: string;
  patch: Partial<{
    nome: string;
    categoriaId: string;
    descricao: string | null;
    precoCusto: number | null;
    precoVenda: number;
    ativo: boolean;
    exibirNoCardapio: boolean;
    imageId: string | null;
    imagemUrl: string | null;
    tamanhos: { id?: string; tamanho: 'P'|'M'|'G'; acrescimo: number }[];
    adicionais: { id?: string; nome: string; preco: number; ativo?: boolean }[];
  }>;
};

@Injectable()
export class UpdateProduto {
  constructor(
    @Inject(ProdutoRepository) // 👈
    private readonly repo: ProdutoRepository,
  ) {}

  async exec({ id, patch }: { id: string; patch: any }) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Produto não encontrado');
    return this.repo.update(id, patch);
  }
}

// get-produto.use-case.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ProdutoRepository } from '../../../domain/produto/produto.repository';

@Injectable()
export class GetProduto {
  constructor(
    @Inject(ProdutoRepository) // 👈
    private readonly repo: ProdutoRepository,
  ) {}

  async exec(id: string) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException('Produto não encontrado');
    return p;
  }
}

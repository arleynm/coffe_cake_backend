// list-produtos.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { ProdutoRepository } from '../../../domain/produto/produto.repository';

@Injectable()
export class ListProdutos {
  constructor(
    @Inject(ProdutoRepository) // 👈
    private readonly repo: ProdutoRepository,
  ) {}

  async exec(params: any) {
    return this.repo.list(params);
  }
}

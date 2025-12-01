import { Injectable, Inject } from '@nestjs/common';
import { ProdutoRepository } from '../../../domain/produto/produto.repository';

@Injectable()
export class DeleteProduto {
  constructor(
    @Inject(ProdutoRepository) // 👈
    private readonly repo: ProdutoRepository,
  ) {}

  async exec(id: string) {
    await this.repo.delete(id);
  }
}

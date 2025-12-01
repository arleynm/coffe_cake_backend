import { Produto } from '../../domain/produto/produto.entity';

export const ProdutoHttp = {
  toResponse(p: Produto) {
    return {
      id: p.id,
      nome: p.nome,
      categoriaId: p.categoriaId,
      descricao: p.descricao,
      precoCusto: p.precoCusto,
      precoVenda: p.precoVenda,
      ativo: p.ativo,
      exibirNoCardapio: p.exibirNoCardapio,
      imageId: p.imageId,
      imagemUrl: p.imagemUrl,
      tamanhos: p.tamanhos,
      adicionais: p.adicionais,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  },
};

import { Prisma, PedidoCompra as PPedido, PedidoCompraItem as PItem } from '@prisma/client';
import { PedidoCompra } from '../../domain/estoque/entities/pedido-compra.entity';
import { PedidoCompraItem } from '../../domain/estoque/entities/pedido-compra-item.entity';

export class PedidoCompraMapper {
  static itemToDomain(i: PItem): PedidoCompraItem {
    return new PedidoCompraItem(
      i.id, i.pedidoCompraId, i.insumoId, i.quantidadeBase,
      i.custoUnitario.toString(), i.depositoId, i.loteCodigo ?? null, i.validade ?? null,
    );
  }

  static toDomain(pedido: PPedido & { itens: PItem[] }): PedidoCompra {
    return new PedidoCompra(
      pedido.id, pedido.numero, pedido.fornecedor ?? null, pedido.status as any,
      pedido.createdAt, pedido.updatedAt,
      pedido.itens?.map(this.itemToDomain) ?? [],
    );
  }

  /** Gera um número único legível, ex.: PC-20250929-142355-ABCD */
  static generateNumero(prefix = 'PC'): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rnd}`;
  }

  static toPrismaCreate(data: {
    numero?: string;
    fornecedor?: string | null;
    itens: {
      insumoId: string; quantidadeBase: number; custoUnitario: string;
      depositoId: string; loteCodigo?: string | null; validade?: Date | null;
    }[];
  }): Prisma.PedidoCompraCreateInput {
    const numero = (data.numero ?? this.generateNumero()).trim(); // <- sempre string

    return {
      numero,                                 // agora é string obrigatória
      fornecedor: data.fornecedor ?? null,
      itens: {
        create: data.itens.map(i => ({
          insumoId: i.insumoId,
          quantidadeBase: i.quantidadeBase,
          custoUnitario: new Prisma.Decimal(i.custoUnitario),
          depositoId: i.depositoId,
          loteCodigo: i.loteCodigo ?? null,
          validade: i.validade ?? null,
        })),
      },
    };
  }
}

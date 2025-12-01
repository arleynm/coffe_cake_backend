import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePedidoUseCase } from '../../../application/use-cases/pedido-compra/create-pedido.usecase';
import { ListPedidosUseCase } from '../../../application/use-cases/pedido-compra/list-pedidos.usecase';
import { ReceberPedidoUseCase } from '../../../application/use-cases/pedido-compra/receber-pedido.usecase';
import { CreatePedidoDto, ListPedidosQueryDto, ReceberPedidoDto } from '../dtos/pedido-compra.dto';
import { PedidoCompraRepository } from '../../../domain/estoque/repositories/pedido-compra.repository';

@Controller('pedidos-compra')
export class PedidoCompraController {
  constructor(
    private createUC: CreatePedidoUseCase,
    private listUC: ListPedidosUseCase,
    private receberUC: ReceberPedidoUseCase,
    private repo: PedidoCompraRepository, // para get simples
  ) {}

  @Post()
  create(@Body() dto: CreatePedidoDto) {
    return this.createUC.execute(dto);
  }

  @Get()
  list(@Query() q: ListPedidosQueryDto) {
    return this.listUC.execute({ status: q.status });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.repo.findById(id);
  }

  @Post(':id/receber')
  receber(@Param('id') id: string, @Body() dto: ReceberPedidoDto) {
    return this.receberUC.execute({ pedidoId: id, ...dto });
  }
}

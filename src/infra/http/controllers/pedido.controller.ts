// src/infra/http/controllers/pedido.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PedidoPrismaRepo } from '../../../infra/repos/pedido/pedido.prisma.repo';
import { CreatePedido } from '../../../application/use-cases/pedido/create-pedido.usecase';
import { UpdatePedido } from '../../../application/use-cases/pedido/update-pedido.usecase';
import { ChangePedidoStatus } from '../../../application/use-cases/pedido/change-status.usecase';
import { ListPedido } from '../../../application/use-cases/pedido/list-pedido.usecase';
import { RemovePedido } from '../../../application/use-cases/pedido/remove-pedido.usecase';
import { GetPedido } from '../../../application/use-cases/pedido/get-pedido.usecase';
import { ChangeStatusHttpDTO, CreatePedidoHttpDTO, UpdatePedidoHttpDTO } from '../dtos/pedido.dto';
import { ListPedidoQueryDTO } from '../dtos/pedido-list.dto'; // 👈 importar aqui

@Controller('pedidos')
export class PedidoController {
  constructor(private repo: PedidoPrismaRepo) {}

  @Get()
  list(@Query() query: ListPedidoQueryDTO) {
    return new ListPedido(this.repo).execute(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return new GetPedido(this.repo).execute(id);
  }

  @Post()
  create(@Body() dto: CreatePedidoHttpDTO) {
    return new CreatePedido(this.repo).execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePedidoHttpDTO) {
    return new UpdatePedido(this.repo).execute(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusHttpDTO) {
    return new ChangePedidoStatus(this.repo).execute(id, dto.status, dto.formaPagamento);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return new RemovePedido(this.repo).execute(id);
  }
}

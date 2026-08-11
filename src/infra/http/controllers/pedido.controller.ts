import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PedidoPrismaRepo } from '../../../infra/repos/pedido/pedido.prisma.repo';
import { Public } from '../../auth/public.decorator';
import { isAuthenticatedRequest } from '../../auth/optional-auth.util';
import { AnonThrottlerGuard } from '../../auth/anon-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { CreatePedido } from '../../../application/use-cases/pedido/create-pedido.usecase';
import { UpdatePedido } from '../../../application/use-cases/pedido/update-pedido.usecase';
import { ChangePedidoStatus } from '../../../application/use-cases/pedido/change-status.usecase';
import { ListPedido } from '../../../application/use-cases/pedido/list-pedido.usecase';
import { RemovePedido } from '../../../application/use-cases/pedido/remove-pedido.usecase';
import { GetPedido } from '../../../application/use-cases/pedido/get-pedido.usecase';
import { ChangeStatusHttpDTO, CreatePedidoHttpDTO, UpdatePedidoHttpDTO } from '../dtos/pedido.dto';
import { ListPedidoQueryDTO } from '../dtos/pedido-list.dto';
import { PedidosEventsService } from '../../../pedidos.events.service';
import { DeliveryService } from '../../../delivery/delivery.service';
import { BaixaEstoquePedidoService } from '../../../application/services/baixa-estoque-pedido.service';
import { CaixaService } from '../../../caixa/caixa.service';

@Controller('pedidos')
export class PedidoController {
  constructor(
    private readonly repo: PedidoPrismaRepo,
    private readonly events: PedidosEventsService,
    private readonly delivery: DeliveryService,
    private readonly baixaEstoque: BaixaEstoquePedidoService,
    private readonly caixa: CaixaService,
  ) {}

  @Public()
  @Get()
  list(@Query() query: ListPedidoQueryDTO, @Req() req: FastifyRequest) {
    // Clientes (não autenticados) só podem consultar pedidos escopados por mesa.
    // Sem mesa, listar todos os pedidos exige login — evita vazar faturamento/clientes.
    if (!isAuthenticatedRequest(req)) {
      if (!query.mesa) {
        throw new UnauthorizedException('Informe a mesa para consultar pedidos.');
      }
      query.todos = false;
    }
    return new ListPedido(this.repo).execute(query);
  }

  @Get('pendentes/contagem')
  contagemPendentes() {
    return this.repo.countPendentes();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return new GetPedido(this.repo).execute(id);
  }

  /**
   * Acompanhamento público do pedido (o cliente acessa via link com o id do pedido).
   * Retorna apenas dados de acompanhamento — sem telefone/observações internas.
   */
  @Public()
  @Get('public/:id')
  async trackPublic(@Param('id') id: string) {
    const p = await new GetPedido(this.repo).execute(id);
    if (!p) throw new NotFoundException('Pedido não encontrado');

    return {
      id: p.id,
      numero: p.numero,
      status: p.status,
      tipoAtendimento: p.tipoAtendimento,
      clienteNome: p.clienteNome,
      formaPagamento: p.formaPagamento,
      taxaEntrega: Number(p.taxaEntrega ?? 0),
      subtotal: Number(p.itens.reduce((s, it) => s + it.subtotal(), 0).toFixed(2)),
      total: p.total(),
      entregaPrevistaEm: p.entregaPrevistaEm,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      endereco:
        p.tipoAtendimento === 'ENTREGA'
          ? {
              rua: p.enderecoRua,
              numero: p.enderecoNumero,
              bairro: p.enderecoBairro,
              cidade: p.enderecoCidade,
              uf: p.enderecoUf,
              complemento: p.enderecoComplemento,
              cep: p.enderecoCep,
            }
          : null,
      itens: p.itens.map((it) => ({
        nome: it.nome,
        tamanho: it.tamanho,
        quantidade: it.quantidade,
        precoUnit: Number(it.precoUnit),
        obs: it.obs,
        subtotal: it.subtotal(),
        adicionais: (it.adicionais ?? []).map((a) => ({ nome: a.nome, preco: Number(a.preco) })),
      })),
    };
  }

  @Public()
  @UseGuards(AnonThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  @Post()
  async create(@Body() dto: CreatePedidoHttpDTO) {
    if (dto.tipoAtendimento === 'ENTREGA') {
      const subtotal = dto.itens.reduce((sum, item) => sum + Number(item.precoUnit) * Number(item.quantidade), 0);
      const quote = await this.delivery.quote({ cep: dto.enderecoCep, bairro: dto.enderecoBairro, subtotal });
      dto.deliveryZoneId = quote.zone.id;
      dto.taxaEntrega = quote.taxa;
      dto.entregaLatitude = quote.latitude;
      dto.entregaLongitude = quote.longitude;
      dto.entregaPrevistaEm = new Date(Date.now() + quote.tempoMaximo * 60_000);
      dto.mesa = 'DELIVERY';
      if (!quote.valorMinimoAtingido) throw new Error(`Pedido mínimo para esta região: R$ ${quote.pedidoMinimo.toFixed(2)}`);
    } else if (dto.tipoAtendimento === 'RETIRADA') {
      const state = await this.delivery.publicState();
      if (!state.config.retiradaAtiva) throw new Error('Retirada indisponível no momento');
      dto.mesa = 'RETIRADA';
      dto.taxaEntrega = 0;
    }
    const created = await new CreatePedido(this.repo).execute(dto);

    // Baixa automática de estoque (best-effort; não bloqueia a venda)
    await this.baixaEstoque.ensureBaixado(created.id);

    await this.events.emit({
      type: 'pedido.created',
      data: created,
    });

    return created;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePedidoHttpDTO) {
    const updated = await new UpdatePedido(this.repo).execute(id, dto);

    await this.events.emit({
      type: 'pedido.updated',
      data: updated,
    });

    return updated;
  }

  @Public()
  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusHttpDTO,
    @Req() req: FastifyRequest,
  ) {
    // Cliente (não autenticado) só pode confirmar o próprio pedido recém-criado
    // (status RECEBIDO + forma de pagamento). Transições da cozinha
    // (PREPARO/PRONTO/ENTREGUE/CANCELADO) exigem login do dono.
    if (!isAuthenticatedRequest(req)) {
      const alvo = dto.status ? String(dto.status).toUpperCase() : undefined;
      if (alvo && alvo !== 'RECEBIDO') {
        throw new ForbiddenException('Operação permitida apenas para o estabelecimento.');
      }
    }

    const updated = await new ChangePedidoStatus(this.repo).execute(
      id,
      dto.status,
      dto.formaPagamento,
    );

    // Cancelou → devolve ao estoque; qualquer outro status → garante que a baixa ocorreu.
    if (String(updated.status).toUpperCase() === 'CANCELADO') {
      await this.baixaEstoque.ensureEstornado(id);
    } else {
      await this.baixaEstoque.ensureBaixado(id);
    }

    // Entregue = pago → lança a venda no caixa automaticamente (se houver caixa aberto)
    if (String(updated.status).toUpperCase() === 'ENTREGUE') {
      await this.caixa.registrarVendaDePedido({
        numero: updated.numero,
        total: updated.total(),
        formaPagamento: (updated as any).formaPagamento ?? null,
        tipoAtendimento: (updated as any).tipoAtendimento ?? null,
      });
    }

    await this.events.emit({
      type: 'pedido.updated',
      data: updated,
    });

    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await new GetPedido(this.repo).execute(id);

    // Devolve ao estoque o que havia sido baixado antes de remover o pedido.
    await this.baixaEstoque.ensureEstornado(id);

    await new RemovePedido(this.repo).execute(id);

    await this.events.emit({
      type: 'pedido.deleted',
      data: {
        id,
        mesa: existing?.mesa ?? null,
      },
    });

    return { ok: true };
  }
}

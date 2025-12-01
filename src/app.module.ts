import { Module } from '@nestjs/common';
import { PrismaModule } from './infra/db/prisma.module';
import { AuthModule } from './infra/auth/auth.module';

// ----- Ports (domain - estoque)
import { UnidadeRepository } from './domain/estoque/repositories/unidade.repository';
import { DepositoRepository } from './domain/estoque/repositories/deposito.repository';
import { InsumoRepository } from './domain/estoque/repositories/insumo.repository';
import { LoteRepository } from './domain/estoque/repositories/lote.repository';
import { MovimentoRepository } from './domain/estoque/repositories/movimento.repository';
import { PedidoCompraRepository } from './domain/estoque/repositories/pedido-compra.repository';

// ----- Port (domain - cardápio)
import { ProdutoRepository } from './domain/produto/produto.repository';
import { CategoriaCardapioRepository } from './domain/cardapio/categoria.repository';

// ===== Port (domain - media)
import { MediaRepository } from './domain/media/media.repository';

// ===== Port (domain - dashboard)
import { DashboardRepository } from './domain/dashboard/dashboard-repository';

// ----- Adapters (infra - Prisma estoque)
import {
  PrismaUnidadeRepository,
  PrismaDepositoRepository,
  PrismaInsumoRepository,
  PrismaLoteRepository,
  PrismaMovimentoRepository,
} from './infra/repos';
import { PrismaPedidoCompraRepository } from './infra/repos/estoque/prisma-pedido-compra.repository';

// ----- Adapters (infra - Prisma cardápio)
import { PrismaProdutoRepository } from './infra/db/prisma-produto.repository';
import { PrismaCategoriaRepository } from './infra/db/prisma-categoria.repository';

// ===== Adapter (infra - Prisma media)
import { PrismaMediaRepository } from './infra/db/prisma/media.prisma.repository';

// ===== Adapter (infra - Prisma dashboard)
import { PrismaDashboardRepository } from './infra/repos/dashboard/prisma-dashboard.repository';

// ----- Use-cases: UNIDADE
import { CreateUnidadeUseCase } from './application/use-cases/unidade/create-unidade.usecase';
import { ListUnidadesUseCase } from './application/use-cases/unidade/list-unidades.usecase';
import { UpdateUnidadeUseCase } from './application/use-cases/unidade/update-unidade.usecase';
import { DeleteUnidadeUseCase } from './application/use-cases/unidade/delete-unidade.usecase';

// ----- Use-cases: DEPOSITO
import { CreateDepositoUseCase } from './application/use-cases/deposito/create-deposito.usecase';
import { ListDepositosUseCase } from './application/use-cases/deposito/list-depositos.usecase';
import { GetDepositoUseCase } from './application/use-cases/deposito/get-deposito.usecase';
import { UpdateDepositoUseCase } from './application/use-cases/deposito/update-deposito.usecase';
import { UpdateStatusDepositoUseCase } from './application/use-cases/deposito/update-status-deposito.usecase';

// ----- Use-cases: INSUMO
import { CreateInsumoUseCase } from './application/use-cases/insumo/create-insumo.usecase';
import { ListInsumosUseCase } from './application/use-cases/insumo/list-insumos.usecase';
import { UpdateInsumoUseCase } from './application/use-cases/insumo/update-insumo.usecase';
import { ToggleInsumoUseCase } from './application/use-cases/insumo/toggle-insumo.usecase';

// ----- Use-cases: LOTE
import { CreateLoteUseCase } from './application/use-cases/lote/create-lote.usecase';
import { GetLoteUseCase } from './application/use-cases/lote/get-lote.usecase';
import { ListLotesUseCase } from './application/use-cases/lote/list-lotes.usecase';
import { UpdateLoteUseCase } from './application/use-cases/lote/update-lote.usecase';

// ----- Use-cases: MOVIMENTO
import { EntradaUseCase } from './application/use-cases/movimento/entrada.usecase';
import { SaidaUseCase } from './application/use-cases/movimento/saida.usecase';
import { AjusteUseCase } from './application/use-cases/movimento/ajuste.usecase';
import { TransferenciaUseCase } from './application/use-cases/movimento/transferencia.usecase';

// ----- Use-cases: PEDIDO COMPRA
import { CreatePedidoUseCase } from './application/use-cases/pedido-compra/create-pedido.usecase';
import { ListPedidosUseCase } from './application/use-cases/pedido-compra/list-pedidos.usecase';
import { ReceberPedidoUseCase } from './application/use-cases/pedido-compra/receber-pedido.usecase';

// ----- Use-cases: PRODUTO (cardápio)
import { CreateProduto } from './application/use-cases/produto/create-produto.use-case';
import { UpdateProduto } from './application/use-cases/produto/update-produto.use-case';
import { DeleteProduto } from './application/use-cases/produto/delete-produto.use-case';
import { GetProduto } from './application/use-cases/produto/get-produto.use-case';
import { ListProdutos } from './application/use-cases/produto/list-produtos.use-case';

// ----- Use-cases: CATEGORIA (cardápio)
import { CreateCategoriaUseCase } from './application/use-cases/categoria/create-categoria.usecase';
import { UpdateCategoriaUseCase } from './application/use-cases/categoria/update-categoria.usecase';
import { GetCategoriaUseCase } from './application/use-cases/categoria/get-categoria.usecase';
import { ListCategoriasUseCase } from './application/use-cases/categoria/list-categorias.usecase';
import { DeleteCategoriaUseCase } from './application/use-cases/categoria/delete-categoria.usecase';

// ===== Use-case: MEDIA
import { UploadMediaUseCase } from './application/use-cases/media/upload-media.usecase';

// ===== Use-case: DASHBOARD
import { GetDashboardMetricsUseCase } from './application/use-cases/dashboard/get-dashboard-metrics.use-case';

// ----- Controllers
import { UnidadeController } from './infra/http/controllers/unidade.controller';
import { DepositoController } from './infra/http/controllers/deposito.controller';
import { InsumoController } from './infra/http/controllers/insumo.controller';
import { MovimentoController } from './infra/http/controllers/movimento.controller';
import { PedidoCompraController } from './infra/http/controllers/pedido-compra.controller';
import { LoteController } from './infra/http/controllers/lote.controller';
import { ProdutoController } from './infra/http/controllers/produto.controller';
import { CategoriaController } from './infra/http/controllers/categoria.controller';
// ===== Controller: MEDIA
import { MediaController } from './infra/http/controllers/media.controller';

import { PedidoController } from './infra/http/controllers/pedido.controller';
import { PedidoPrismaRepo } from './infra/repos/pedido/pedido.prisma.repo';

import { PedidosEventsController } from './infra/http/controllers/pedidos.events.controller';
import { PedidosEventsService } from './pedidos.events.service';

import { PedidosService } from './pedidos.service';

// ===== Controller: DASHBOARD
import { DashboardController } from './infra/http/controllers/dashboard.controller';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),

    PrismaModule,
    AuthModule,
  ],
  controllers: [
    // estoque
    UnidadeController,
    PedidoController,
    DepositoController,
    InsumoController,
    MovimentoController,
    PedidoCompraController,
    LoteController,
    // cardápio
    ProdutoController,
    CategoriaController,
    // media
    MediaController,
    PedidosEventsController,
    DashboardController,
  ],
  providers: [
    PedidoPrismaRepo,
    { provide: UnidadeRepository,   useClass: PrismaUnidadeRepository },
    { provide: DepositoRepository,  useClass: PrismaDepositoRepository },
    { provide: InsumoRepository,    useClass: PrismaInsumoRepository },
    { provide: LoteRepository,      useClass: PrismaLoteRepository },
    { provide: MovimentoRepository, useClass: PrismaMovimentoRepository },
    { provide: PedidoCompraRepository, useClass: PrismaPedidoCompraRepository },

    { provide: ProdutoRepository,           useClass: PrismaProdutoRepository },
    { provide: CategoriaCardapioRepository, useClass: PrismaCategoriaRepository },

    { provide: MediaRepository, useClass: PrismaMediaRepository },

    { provide: DashboardRepository, useClass: PrismaDashboardRepository },

    PedidosEventsService,
    PedidosService,

    CreateUnidadeUseCase,
    ListUnidadesUseCase,
    UpdateUnidadeUseCase,
    DeleteUnidadeUseCase,

    CreateDepositoUseCase,
    ListDepositosUseCase,
    GetDepositoUseCase,
    UpdateDepositoUseCase,
    UpdateStatusDepositoUseCase,

    CreateInsumoUseCase,
    ListInsumosUseCase,
    UpdateInsumoUseCase,
    ToggleInsumoUseCase,

    CreateLoteUseCase,
    GetLoteUseCase,
    ListLotesUseCase,
    UpdateLoteUseCase,

    EntradaUseCase,
    SaidaUseCase,
    AjusteUseCase,
    TransferenciaUseCase,

    // Use-cases: PEDIDO COMPRA
    CreatePedidoUseCase,
    ListPedidosUseCase,
    ReceberPedidoUseCase,

    // Use-cases: PRODUTO (cardápio)
    CreateProduto,
    UpdateProduto,
    DeleteProduto,
    GetProduto,
    ListProdutos,

    // Use-cases: CATEGORIA (cardápio)
    CreateCategoriaUseCase,
    UpdateCategoriaUseCase,
    GetCategoriaUseCase,
    ListCategoriasUseCase,
    DeleteCategoriaUseCase,

    // Use-case: MEDIA
    UploadMediaUseCase,

    // Use-case: DASHBOARD
    GetDashboardMetricsUseCase,
  ],
})
export class AppModule {}

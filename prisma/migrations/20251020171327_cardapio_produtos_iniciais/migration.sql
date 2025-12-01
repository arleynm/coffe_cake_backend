/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Unidade` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `fatorBase` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Unidade_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Insumo` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `unidadeBaseId` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `estoqueMinimo` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Insumo_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversaoUnidade` (
    `id` VARCHAR(191) NOT NULL,
    `deId` VARCHAR(191) NOT NULL,
    `paraId` VARCHAR(191) NOT NULL,
    `fator` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deposito` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Deposito_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lote` (
    `id` VARCHAR(191) NOT NULL,
    `insumoId` VARCHAR(191) NOT NULL,
    `depositoId` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `validade` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimentoEstoque` (
    `id` VARCHAR(191) NOT NULL,
    `insumoId` VARCHAR(191) NOT NULL,
    `depositoId` VARCHAR(191) NOT NULL,
    `loteId` VARCHAR(191) NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'TRANSFERENCIA_SAIDA', 'TRANSFERENCIA_ENTRADA', 'PERDA', 'PRODUCAO_CONSUMO', 'PRODUCAO_GERACAO') NOT NULL,
    `quantidadeBase` DOUBLE NOT NULL,
    `custoUnitario` DECIMAL(14, 4) NULL,
    `documentoRef` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MovimentoEstoque_insumoId_depositoId_idx`(`insumoId`, `depositoId`),
    INDEX `MovimentoEstoque_loteId_idx`(`loteId`),
    INDEX `MovimentoEstoque_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoCompra` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `fornecedor` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ABERTO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PedidoCompra_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoCompraItem` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoCompraId` VARCHAR(191) NOT NULL,
    `insumoId` VARCHAR(191) NOT NULL,
    `quantidadeBase` DOUBLE NOT NULL,
    `custoUnitario` DECIMAL(14, 4) NOT NULL,
    `depositoId` VARCHAR(191) NOT NULL,
    `loteCodigo` VARCHAR(191) NULL,
    `validade` DATETIME(3) NULL,

    INDEX `PedidoCompraItem_pedidoCompraId_idx`(`pedidoCompraId`),
    INDEX `PedidoCompraItem_insumoId_idx`(`insumoId`),
    INDEX `PedidoCompraItem_depositoId_idx`(`depositoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Media_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaCardapio` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CategoriaCardapio_slug_key`(`slug`),
    INDEX `CategoriaCardapio_ativo_idx`(`ativo`),
    INDEX `CategoriaCardapio_ordem_idx`(`ordem`),
    UNIQUE INDEX `CategoriaCardapio_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produto` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `categoriaId` VARCHAR(191) NOT NULL,
    `precoCusto` DECIMAL(14, 2) NULL,
    `precoVenda` DECIMAL(14, 2) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `exibirNoCardapio` BOOLEAN NOT NULL DEFAULT true,
    `imageId` VARCHAR(191) NULL,
    `imagemUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Produto_categoriaId_idx`(`categoriaId`),
    INDEX `Produto_ativo_exibirNoCardapio_idx`(`ativo`, `exibirNoCardapio`),
    INDEX `Produto_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoTamanho` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `tamanho` ENUM('P', 'M', 'G') NOT NULL,
    `acrescimo` DECIMAL(14, 2) NOT NULL DEFAULT 0,

    INDEX `ProdutoTamanho_produtoId_idx`(`produtoId`),
    UNIQUE INDEX `ProdutoTamanho_produtoId_tamanho_key`(`produtoId`, `tamanho`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoAdicional` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(14, 2) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `ProdutoAdicional_produtoId_ativo_idx`(`produtoId`, `ativo`),
    UNIQUE INDEX `ProdutoAdicional_produtoId_nome_key`(`produtoId`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Insumo` ADD CONSTRAINT `Insumo_unidadeBaseId_fkey` FOREIGN KEY (`unidadeBaseId`) REFERENCES `Unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversaoUnidade` ADD CONSTRAINT `ConversaoUnidade_deId_fkey` FOREIGN KEY (`deId`) REFERENCES `Unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversaoUnidade` ADD CONSTRAINT `ConversaoUnidade_paraId_fkey` FOREIGN KEY (`paraId`) REFERENCES `Unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lote` ADD CONSTRAINT `Lote_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lote` ADD CONSTRAINT `Lote_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `Deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `Deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimentoEstoque` ADD CONSTRAINT `MovimentoEstoque_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `Lote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoCompraItem` ADD CONSTRAINT `PedidoCompraItem_pedidoCompraId_fkey` FOREIGN KEY (`pedidoCompraId`) REFERENCES `PedidoCompra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoCompraItem` ADD CONSTRAINT `PedidoCompraItem_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoCompraItem` ADD CONSTRAINT `PedidoCompraItem_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `Deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `CategoriaCardapio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoTamanho` ADD CONSTRAINT `ProdutoTamanho_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoAdicional` ADD CONSTRAINT `ProdutoAdicional_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `conversaounidade` DROP FOREIGN KEY `ConversaoUnidade_deId_fkey`;

-- DropForeignKey
ALTER TABLE `conversaounidade` DROP FOREIGN KEY `ConversaoUnidade_paraId_fkey`;

-- DropForeignKey
ALTER TABLE `insumo` DROP FOREIGN KEY `Insumo_unidadeBaseId_fkey`;

-- DropForeignKey
ALTER TABLE `lote` DROP FOREIGN KEY `Lote_depositoId_fkey`;

-- DropForeignKey
ALTER TABLE `lote` DROP FOREIGN KEY `Lote_insumoId_fkey`;

-- DropForeignKey
ALTER TABLE `movimentoestoque` DROP FOREIGN KEY `MovimentoEstoque_depositoId_fkey`;

-- DropForeignKey
ALTER TABLE `movimentoestoque` DROP FOREIGN KEY `MovimentoEstoque_insumoId_fkey`;

-- DropForeignKey
ALTER TABLE `movimentoestoque` DROP FOREIGN KEY `MovimentoEstoque_loteId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidocompraitem` DROP FOREIGN KEY `PedidoCompraItem_depositoId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidocompraitem` DROP FOREIGN KEY `PedidoCompraItem_insumoId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidocompraitem` DROP FOREIGN KEY `PedidoCompraItem_pedidoCompraId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidoitem` DROP FOREIGN KEY `PedidoItem_pedidoId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidoitem` DROP FOREIGN KEY `PedidoItem_produtoId_fkey`;

-- DropForeignKey
ALTER TABLE `pedidoitemadicional` DROP FOREIGN KEY `PedidoItemAdicional_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `produto` DROP FOREIGN KEY `Produto_categoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `produto` DROP FOREIGN KEY `Produto_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `produtoadicional` DROP FOREIGN KEY `ProdutoAdicional_produtoId_fkey`;

-- DropForeignKey
ALTER TABLE `produtotamanho` DROP FOREIGN KEY `ProdutoTamanho_produtoId_fkey`;

-- DropForeignKey
ALTER TABLE `refreshtoken` DROP FOREIGN KEY `RefreshToken_userId_fkey`;

-- CreateTable
CREATE TABLE `notificationtoken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NOT NULL DEFAULT 'web',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notificationtoken_token_key`(`token`),
    INDEX `notificationtoken_userId_idx`(`userId`),
    INDEX `notificationtoken_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notificationtoken` ADD CONSTRAINT `notificationtoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refreshtoken` ADD CONSTRAINT `refreshtoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumo` ADD CONSTRAINT `insumo_unidadeBaseId_fkey` FOREIGN KEY (`unidadeBaseId`) REFERENCES `unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversaounidade` ADD CONSTRAINT `conversaounidade_deId_fkey` FOREIGN KEY (`deId`) REFERENCES `unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversaounidade` ADD CONSTRAINT `conversaounidade_paraId_fkey` FOREIGN KEY (`paraId`) REFERENCES `unidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lote` ADD CONSTRAINT `lote_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lote` ADD CONSTRAINT `lote_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentoestoque` ADD CONSTRAINT `movimentoestoque_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentoestoque` ADD CONSTRAINT `movimentoestoque_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentoestoque` ADD CONSTRAINT `movimentoestoque_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `lote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidocompraitem` ADD CONSTRAINT `pedidocompraitem_pedidoCompraId_fkey` FOREIGN KEY (`pedidoCompraId`) REFERENCES `pedidocompra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidocompraitem` ADD CONSTRAINT `pedidocompraitem_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidocompraitem` ADD CONSTRAINT `pedidocompraitem_depositoId_fkey` FOREIGN KEY (`depositoId`) REFERENCES `deposito`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `produto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categoriacardapio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `produto_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtotamanho` ADD CONSTRAINT `produtotamanho_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtoadicional` ADD CONSTRAINT `produtoadicional_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidoitem` ADD CONSTRAINT `pedidoitem_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidoitem` ADD CONSTRAINT `pedidoitem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidoitemadicional` ADD CONSTRAINT `pedidoitemadicional_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `pedidoitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `categoriacardapio` RENAME INDEX `CategoriaCardapio_ativo_idx` TO `categoriacardapio_ativo_idx`;

-- RenameIndex
ALTER TABLE `categoriacardapio` RENAME INDEX `CategoriaCardapio_nome_key` TO `categoriacardapio_nome_key`;

-- RenameIndex
ALTER TABLE `categoriacardapio` RENAME INDEX `CategoriaCardapio_ordem_idx` TO `categoriacardapio_ordem_idx`;

-- RenameIndex
ALTER TABLE `categoriacardapio` RENAME INDEX `CategoriaCardapio_slug_key` TO `categoriacardapio_slug_key`;

-- RenameIndex
ALTER TABLE `deposito` RENAME INDEX `Deposito_nome_key` TO `deposito_nome_key`;

-- RenameIndex
ALTER TABLE `insumo` RENAME INDEX `Insumo_sku_key` TO `insumo_sku_key`;

-- RenameIndex
ALTER TABLE `media` RENAME INDEX `Media_path_key` TO `media_path_key`;

-- RenameIndex
ALTER TABLE `movimentoestoque` RENAME INDEX `MovimentoEstoque_createdAt_idx` TO `movimentoestoque_createdAt_idx`;

-- RenameIndex
ALTER TABLE `movimentoestoque` RENAME INDEX `MovimentoEstoque_insumoId_depositoId_idx` TO `movimentoestoque_insumoId_depositoId_idx`;

-- RenameIndex
ALTER TABLE `movimentoestoque` RENAME INDEX `MovimentoEstoque_loteId_idx` TO `movimentoestoque_loteId_idx`;

-- RenameIndex
ALTER TABLE `pedido` RENAME INDEX `Pedido_formaPagamento_idx` TO `pedido_formaPagamento_idx`;

-- RenameIndex
ALTER TABLE `pedido` RENAME INDEX `Pedido_numero_key` TO `pedido_numero_key`;

-- RenameIndex
ALTER TABLE `pedido` RENAME INDEX `Pedido_status_createdAt_idx` TO `pedido_status_createdAt_idx`;

-- RenameIndex
ALTER TABLE `pedidocompra` RENAME INDEX `PedidoCompra_numero_key` TO `pedidocompra_numero_key`;

-- RenameIndex
ALTER TABLE `pedidocompraitem` RENAME INDEX `PedidoCompraItem_depositoId_idx` TO `pedidocompraitem_depositoId_idx`;

-- RenameIndex
ALTER TABLE `pedidocompraitem` RENAME INDEX `PedidoCompraItem_insumoId_idx` TO `pedidocompraitem_insumoId_idx`;

-- RenameIndex
ALTER TABLE `pedidocompraitem` RENAME INDEX `PedidoCompraItem_pedidoCompraId_idx` TO `pedidocompraitem_pedidoCompraId_idx`;

-- RenameIndex
ALTER TABLE `pedidoitem` RENAME INDEX `PedidoItem_pedidoId_idx` TO `pedidoitem_pedidoId_idx`;

-- RenameIndex
ALTER TABLE `pedidoitem` RENAME INDEX `PedidoItem_produtoId_idx` TO `pedidoitem_produtoId_idx`;

-- RenameIndex
ALTER TABLE `pedidoitemadicional` RENAME INDEX `PedidoItemAdicional_itemId_idx` TO `pedidoitemadicional_itemId_idx`;

-- RenameIndex
ALTER TABLE `produto` RENAME INDEX `Produto_ativo_exibirNoCardapio_idx` TO `produto_ativo_exibirNoCardapio_idx`;

-- RenameIndex
ALTER TABLE `produto` RENAME INDEX `Produto_categoriaId_idx` TO `produto_categoriaId_idx`;

-- RenameIndex
ALTER TABLE `produto` RENAME INDEX `Produto_createdAt_idx` TO `produto_createdAt_idx`;

-- RenameIndex
ALTER TABLE `produtoadicional` RENAME INDEX `ProdutoAdicional_produtoId_ativo_idx` TO `produtoadicional_produtoId_ativo_idx`;

-- RenameIndex
ALTER TABLE `produtoadicional` RENAME INDEX `ProdutoAdicional_produtoId_nome_key` TO `produtoadicional_produtoId_nome_key`;

-- RenameIndex
ALTER TABLE `produtotamanho` RENAME INDEX `ProdutoTamanho_produtoId_idx` TO `produtotamanho_produtoId_idx`;

-- RenameIndex
ALTER TABLE `produtotamanho` RENAME INDEX `ProdutoTamanho_produtoId_tamanho_key` TO `produtotamanho_produtoId_tamanho_key`;

-- RenameIndex
ALTER TABLE `refreshtoken` RENAME INDEX `RefreshToken_expiresAt_idx` TO `refreshtoken_expiresAt_idx`;

-- RenameIndex
ALTER TABLE `refreshtoken` RENAME INDEX `RefreshToken_userId_idx` TO `refreshtoken_userId_idx`;

-- RenameIndex
ALTER TABLE `unidade` RENAME INDEX `Unidade_codigo_key` TO `unidade_codigo_key`;

-- RenameIndex
ALTER TABLE `usuario` RENAME INDEX `Usuario_email_key` TO `usuario_email_key`;

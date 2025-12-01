-- CreateTable
CREATE TABLE `Pedido` (
    `id` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL AUTO_INCREMENT,
    `mesa` VARCHAR(191) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `status` ENUM('RECEBIDO', 'PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO') NOT NULL DEFAULT 'RECEBIDO',
    `total` DECIMAL(14, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pedido_numero_key`(`numero`),
    INDEX `Pedido_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoItem` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tamanho` ENUM('P', 'M', 'G') NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `precoUnit` DECIMAL(14, 2) NOT NULL,
    `obs` VARCHAR(191) NULL,

    INDEX `PedidoItem_pedidoId_idx`(`pedidoId`),
    INDEX `PedidoItem_produtoId_idx`(`produtoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoItemAdicional` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(14, 2) NOT NULL,

    INDEX `PedidoItemAdicional_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PedidoItem` ADD CONSTRAINT `PedidoItem_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoItem` ADD CONSTRAINT `PedidoItem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoItemAdicional` ADD CONSTRAINT `PedidoItemAdicional_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `PedidoItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

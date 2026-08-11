-- CreateTable
CREATE TABLE `appnotification` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PEDIDO_CRIADO', 'PEDIDO_ATUALIZADO', 'PEDIDO_CANCELADO') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    INDEX `appnotification_createdAt_idx`(`createdAt`),
    INDEX `appnotification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

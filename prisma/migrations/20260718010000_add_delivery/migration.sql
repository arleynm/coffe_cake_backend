CREATE TABLE `deliveryconfig` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'default',
  `deliveryAtivo` BOOLEAN NOT NULL DEFAULT false,
  `lojaAberta` BOOLEAN NOT NULL DEFAULT false,
  `retiradaAtiva` BOOLEAN NOT NULL DEFAULT true,
  `tempoMinimo` INTEGER NOT NULL DEFAULT 35,
  `tempoMaximo` INTEGER NOT NULL DEFAULT 55,
  `pedidoMinimo` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `deliveryzone` (
  `id` VARCHAR(191) NOT NULL,
  `nome` VARCHAR(191) NOT NULL,
  `bairros` JSON NOT NULL,
  `prefixosCep` JSON NOT NULL,
  `taxa` DECIMAL(14,2) NOT NULL,
  `pedidoMinimo` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `tempoMinimo` INTEGER NULL,
  `tempoMaximo` INTEGER NULL,
  `ativa` BOOLEAN NOT NULL DEFAULT true,
  `ordem` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `deliveryzone_ativa_ordem_idx` (`ativa`, `ordem`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `pedido`
  ADD COLUMN `tipoAtendimento` ENUM('LOCAL','RETIRADA','ENTREGA') NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN `clienteNome` VARCHAR(191) NULL,
  ADD COLUMN `clienteTelefone` VARCHAR(191) NULL,
  ADD COLUMN `deliveryZoneId` VARCHAR(191) NULL,
  ADD COLUMN `enderecoCep` VARCHAR(191) NULL,
  ADD COLUMN `enderecoRua` VARCHAR(191) NULL,
  ADD COLUMN `enderecoNumero` VARCHAR(191) NULL,
  ADD COLUMN `enderecoBairro` VARCHAR(191) NULL,
  ADD COLUMN `enderecoCidade` VARCHAR(191) NULL,
  ADD COLUMN `enderecoUf` VARCHAR(191) NULL,
  ADD COLUMN `enderecoComplemento` VARCHAR(191) NULL,
  ADD COLUMN `taxaEntrega` DECIMAL(14,2) NOT NULL DEFAULT 0;

CREATE INDEX `pedido_tipoAtendimento_createdAt_idx` ON `pedido`(`tipoAtendimento`, `createdAt`);
CREATE INDEX `pedido_deliveryZoneId_idx` ON `pedido`(`deliveryZoneId`);
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_deliveryZoneId_fkey` FOREIGN KEY (`deliveryZoneId`) REFERENCES `deliveryzone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

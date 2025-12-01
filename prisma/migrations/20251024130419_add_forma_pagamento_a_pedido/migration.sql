-- AlterTable
ALTER TABLE `pedido` ADD COLUMN `formaPagamento` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO') NOT NULL DEFAULT 'PIX';

-- CreateIndex
CREATE INDEX `Pedido_formaPagamento_idx` ON `Pedido`(`formaPagamento`);

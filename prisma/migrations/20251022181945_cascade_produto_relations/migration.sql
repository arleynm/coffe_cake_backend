-- DropForeignKey
ALTER TABLE `produtoadicional` DROP FOREIGN KEY `ProdutoAdicional_produtoId_fkey`;

-- DropForeignKey
ALTER TABLE `produtotamanho` DROP FOREIGN KEY `ProdutoTamanho_produtoId_fkey`;

-- AddForeignKey
ALTER TABLE `ProdutoTamanho` ADD CONSTRAINT `ProdutoTamanho_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoAdicional` ADD CONSTRAINT `ProdutoAdicional_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `deliveryconfig`
  ADD COLUMN `lojaLatitude` DECIMAL(10,7) NULL,
  ADD COLUMN `lojaLongitude` DECIMAL(10,7) NULL,
  ADD COLUMN `mapaZoom` INTEGER NOT NULL DEFAULT 13;

ALTER TABLE `deliveryzone`
  ADD COLUMN `poligono` JSON NULL,
  ADD COLUMN `cor` VARCHAR(191) NOT NULL DEFAULT '#b65d24';

ALTER TABLE `pedido`
  ADD COLUMN `entregaLatitude` DECIMAL(10,7) NULL,
  ADD COLUMN `entregaLongitude` DECIMAL(10,7) NULL,
  ADD COLUMN `entregaPrevistaEm` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `idempotencyKey` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_idempotencyKey_key` ON `Order`(`idempotencyKey`);

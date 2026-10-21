-- AlterTable
ALTER TABLE `Order` MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `guestEmail` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `Order_guestEmail_idx` ON `Order`(`guestEmail`);

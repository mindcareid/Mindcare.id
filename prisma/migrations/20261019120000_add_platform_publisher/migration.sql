-- Akun publisher platform (mis. "MindCare.id") untuk event yang diterbitkan
-- oleh admin/superadmin. Identitas ini bukan akun login: tidak punya kredensial.

-- CreateTable
CREATE TABLE `Platform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Platform_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `platformId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Event_platformId_status_startDate_idx` ON `Event`(`platformId`, `status`, `startDate`);

-- Akun platform default. Idempoten lewat unique index `Platform_slug_key`,
-- jadi aman dijalankan di environment yang barisnya sudah ada.
INSERT IGNORE INTO `Platform` (`name`, `slug`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('MindCare.id', 'mindcare', true, NOW(3), NOW(3));

-- Event PLATFORM lama belum menunjuk akun platform; arahkan ke akun default.
UPDATE `Event`
SET `platformId` = (SELECT `id` FROM `Platform` WHERE `slug` = 'mindcare' LIMIT 1)
WHERE `publisherType` = 'PLATFORM'
  AND `platformId` IS NULL;

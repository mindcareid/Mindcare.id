-- AlterTable
ALTER TABLE `CareCentre` ADD COLUMN `cityCode` VARCHAR(10) NULL,
    ADD COLUMN `provinceCode` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `Professional` ADD COLUMN `baseCityCode` VARCHAR(10) NULL,
    ADD COLUMN `baseProvinceCode` VARCHAR(10) NULL;

-- CreateTable
CREATE TABLE `Province` (
    `id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Regency` (
    `id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provinceId` VARCHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Regency_provinceId_idx`(`provinceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

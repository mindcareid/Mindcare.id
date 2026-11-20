-- AlterTable
ALTER TABLE `Event` ADD COLUMN `workshopNote` TEXT NULL;

-- CreateTable
CREATE TABLE `EventWorkshop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `speakerId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `price` VARCHAR(255) NULL,
    `link` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventWorkshop_eventId_startTime_idx`(`eventId`, `startTime`),
    INDEX `EventWorkshop_speakerId_idx`(`speakerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

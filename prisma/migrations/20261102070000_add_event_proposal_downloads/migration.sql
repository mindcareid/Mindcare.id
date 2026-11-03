ALTER TABLE `Event`
    ADD COLUMN `proposalUrl` VARCHAR(1000) NULL,
    ADD COLUMN `proposalPublicId` VARCHAR(255) NULL;

CREATE TABLE `EventProposalDownload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `eventName` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `institution` VARCHAR(255) NULL,
    `position` VARCHAR(255) NULL,
    `source` VARCHAR(20) NOT NULL DEFAULT 'ATTACHED',
    `documentWarning` VARCHAR(500) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `emailSentAt` DATETIME(3) NULL,
    `emailError` VARCHAR(500) NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventProposalDownload_eventId_createdAt_idx`(`eventId`, `createdAt`),
    INDEX `EventProposalDownload_email_idx`(`email`),
    INDEX `EventProposalDownload_createdAt_idx`(`createdAt`),
    INDEX `EventProposalDownload_createdAt_email_idx`(`createdAt`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EventProposalDownload` ADD CONSTRAINT `EventProposalDownload_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

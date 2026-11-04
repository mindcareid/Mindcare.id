CREATE TABLE `Country` (
    `code` VARCHAR(2) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `callingCode` VARCHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Country_name_idx`(`name`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EventSponsorTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `priceAmount` INTEGER NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `displayUsd` INTEGER NULL,
    `fxRateUsed` INTEGER NULL,
    `benefits` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventSponsorTier_eventId_isActive_sortOrder_idx`(`eventId`, `isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `EventSponsorApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referenceNo` VARCHAR(32) NOT NULL,
    `eventId` INTEGER NOT NULL,
    `tierId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    `companyName` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `countryCode` VARCHAR(2) NOT NULL,
    `website` VARCHAR(500) NULL,
    `companyEmail` VARCHAR(255) NULL,
    `picFirstName` VARCHAR(120) NOT NULL,
    `picLastName` VARCHAR(120) NOT NULL,
    `picTitle` VARCHAR(20) NULL,
    `picPosition` VARCHAR(255) NOT NULL,
    `picPhone` VARCHAR(30) NOT NULL,
    `picEmail` VARCHAR(255) NOT NULL,
    `notes` TEXT NULL,
    `priceAmountSnapshot` INTEGER NOT NULL,
    `currencySnapshot` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `displayUsdSnapshot` INTEGER NULL,
    `emailSentAt` DATETIME(3) NULL,
    `emailError` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventSponsorApplication_referenceNo_key`(`referenceNo`),
    INDEX `EventSponsorApplication_eventId_status_createdAt_idx`(`eventId`, `status`, `createdAt`),
    INDEX `EventSponsorApplication_companyName_idx`(`companyName`),
    INDEX `EventSponsorApplication_picEmail_idx`(`picEmail`),
    INDEX `EventSponsorApplication_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EventSponsorTier` ADD CONSTRAINT `EventSponsorTier_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EventSponsorApplication` ADD CONSTRAINT `EventSponsorApplication_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EventSponsorApplication` ADD CONSTRAINT `EventSponsorApplication_tierId_fkey`
    FOREIGN KEY (`tierId`) REFERENCES `EventSponsorTier`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

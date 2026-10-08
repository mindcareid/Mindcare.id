/*
  Warnings:

  - You are about to alter the column `phoneNumber` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `phoneVerificationCode` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `linkedin` VARCHAR(255) NULL,
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `emailVerificationToken` VARCHAR(255) NULL,
    MODIFY `phoneNumber` VARCHAR(50) NULL,
    MODIFY `phoneVerificationCode` VARCHAR(20) NULL,
    MODIFY `username` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `bio` TEXT NULL,
    MODIFY `publicId` VARCHAR(255) NULL,
    MODIFY `photo` VARCHAR(500) NULL,
    MODIFY `instagram` VARCHAR(255) NULL,
    MODIFY `facebook` VARCHAR(255) NULL,
    MODIFY `jobName` VARCHAR(255) NULL,
    MODIFY `jobTitle` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `Categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `publicId` VARCHAR(255) NULL,
    `photo` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriesSub` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoriesId` INTEGER NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CategoriesSub_categoriesId_idx`(`categoriesId`),
    UNIQUE INDEX `CategoriesSub_categoriesId_slug_key`(`categoriesId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAccess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `role` ENUM('ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'ADMIN',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminAccess_userId_key`(`userId`),
    INDEX `AdminAccess_role_isActive_idx`(`role`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `publicId` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(500) NULL,
    `website` VARCHAR(500) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `instagram` VARCHAR(255) NULL,
    `facebook` VARCHAR(255) NULL,
    `linkedin` VARCHAR(255) NULL,
    `location` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `postalCode` VARCHAR(20) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `verification` ENUM('UNVERIFIED', 'PENDING', 'VERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_slug_key`(`slug`),
    UNIQUE INDEX `Company_publicId_key`(`publicId`),
    INDEX `Company_status_isFeatured_idx`(`status`, `isFeatured`),
    INDEX `Company_city_province_idx`(`city`, `province`),
    INDEX `Company_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'TRAINER', 'FINANCE', 'EDITOR') NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CompanyUser_companyId_status_idx`(`companyId`, `status`),
    INDEX `CompanyUser_userId_status_idx`(`userId`, `status`),
    UNIQUE INDEX `CompanyUser_userId_companyId_key`(`userId`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareCentre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `kind` ENUM('KLINIK', 'RUMAH_SAKIT', 'PUSKESMAS', 'PUSAT_KONSELING') NOT NULL,
    `photoUrl` VARCHAR(500) NULL,
    `publicId` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `postalCode` VARCHAR(10) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `website` VARCHAR(255) NULL,
    `country` VARCHAR(100) NULL,
    `acceptsBpjs` BOOLEAN NOT NULL DEFAULT false,
    `timeZone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    `openingNote` VARCHAR(500) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `appointmentAvailable` BOOLEAN NOT NULL DEFAULT false,
    `onlineAvailable` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `listingStatus` ENUM('PENDING', 'LISTED', 'REJECTED', 'APPROVED', 'PUBLISHED', 'DRAFT') NOT NULL DEFAULT 'PENDING',
    `verificationReview` ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED') NOT NULL DEFAULT 'NONE',
    `verificationCheckedOn` DATETIME(3) NULL,
    `verificationValidUntil` DATETIME(3) NULL,
    `verificationSource` ENUM('SUBMISSION', 'REGISTRY') NULL,
    `verificationAdminId` INTEGER NULL,
    `verificationNote` VARCHAR(500) NULL,
    `permitType` VARCHAR(100) NULL,
    `permitNumber` VARCHAR(100) NULL,
    `permitValidUntil` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CareCentre_slug_key`(`slug`),
    INDEX `CareCentre_listingStatus_deletedAt_idx`(`listingStatus`, `deletedAt`),
    INDEX `CareCentre_kind_city_idx`(`kind`, `city`),
    INDEX `CareCentre_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareCentreOpeningHour` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `centreId` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `opens` VARCHAR(5) NULL,
    `closes` VARCHAR(5) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CareCentreOpeningHour_centreId_day_key`(`centreId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareCentreUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `centreId` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'ADMIN') NOT NULL DEFAULT 'OWNER',
    `status` ENUM('PENDING', 'ACTIVE', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `activeUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CareCentreUser_activeUserId_key`(`activeUserId`),
    INDEX `CareCentreUser_centreId_idx`(`centreId`),
    INDEX `CareCentreUser_userId_idx`(`userId`),
    UNIQUE INDEX `CareCentreUser_userId_centreId_key`(`userId`, `centreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CareCentreService` (
    `centreId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    INDEX `CareCentreService_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`centreId`, `serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Solution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerUserId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `organizationName` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `tagline` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `logo` VARCHAR(500) NULL,
    `coverImage` VARCHAR(500) NULL,
    `logoPublicId` VARCHAR(255) NULL,
    `coverPublicId` VARCHAR(255) NULL,
    `website` VARCHAR(500) NULL,
    `contactEmail` VARCHAR(255) NULL,
    `contactPhone` VARCHAR(50) NULL,
    `listingStatus` ENUM('PENDING', 'LISTED', 'REJECTED', 'APPROVED', 'PUBLISHED', 'DRAFT') NOT NULL DEFAULT 'PENDING',
    `verificationReview` ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED') NOT NULL DEFAULT 'NONE',
    `verificationCheckedOn` DATETIME(3) NULL,
    `verificationValidUntil` DATETIME(3) NULL,
    `verificationSource` ENUM('SUBMISSION', 'REGISTRY') NULL,
    `verificationAdminId` INTEGER NULL,
    `verificationNote` VARCHAR(500) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Solution_ownerUserId_key`(`ownerUserId`),
    UNIQUE INDEX `Solution_slug_key`(`slug`),
    INDEX `Solution_ownerUserId_idx`(`ownerUserId`),
    INDEX `Solution_companyId_idx`(`companyId`),
    INDEX `Solution_categoryId_listingStatus_idx`(`categoryId`, `listingStatus`),
    INDEX `Solution_listingStatus_isFeatured_idx`(`listingStatus`, `isFeatured`),
    INDEX `Solution_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolutionCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(255) NULL,
    `theme` VARCHAR(20) NOT NULL DEFAULT 'navy',
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SolutionCategory_slug_key`(`slug`),
    INDEX `SolutionCategory_isActive_orderIndex_idx`(`isActive`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolutionFocusArea` (
    `solutionId` INTEGER NOT NULL,
    `areaId` INTEGER NOT NULL,

    INDEX `SolutionFocusArea_areaId_idx`(`areaId`),
    PRIMARY KEY (`solutionId`, `areaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolutionAudience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SolutionAudience_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolutionAudienceMap` (
    `solutionId` INTEGER NOT NULL,
    `audienceId` INTEGER NOT NULL,

    INDEX `SolutionAudienceMap_audienceId_idx`(`audienceId`),
    PRIMARY KEY (`solutionId`, `audienceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(1000) NOT NULL,
    `publicId` VARCHAR(500) NULL,
    `type` ENUM('IMAGE', 'VIDEO', 'DOCUMENT') NOT NULL DEFAULT 'IMAGE',
    `altText` VARCHAR(255) NULL,
    `companyId` INTEGER NULL,
    `solutionId` INTEGER NULL,
    `careCentreId` INTEGER NULL,
    `professionalId` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Media_companyId_sortOrder_idx`(`companyId`, `sortOrder`),
    INDEX `Media_solutionId_sortOrder_idx`(`solutionId`, `sortOrder`),
    INDEX `Media_careCentreId_sortOrder_idx`(`careCentreId`, `sortOrder`),
    INDEX `Media_professionalId_sortOrder_idx`(`professionalId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` ENUM('COMPANY_INVITE', 'COMPANY_ACCEPTED', 'COMPANY_DECLINED', 'GENERAL') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'ACTIVE', 'DECLINED', 'READ') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
    INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Notification_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeroSlider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `subtitle` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `publicId` VARCHAR(500) NULL,
    `buttonText` VARCHAR(255) NULL,
    `buttonUrl` VARCHAR(500) NULL,
    `alignText` VARCHAR(20) NOT NULL DEFAULT 'left',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HeroSlider_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhyUs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `publicId` VARCHAR(500) NULL,
    `hoverImage` VARCHAR(500) NULL,
    `hoverPublicId` VARCHAR(500) NULL,
    `type` ENUM('WHY_US', 'SERVICES', 'VISION', 'MISSION', 'OTHER') NOT NULL DEFAULT 'WHY_US',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `publicId` VARCHAR(500) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `imagePosition` VARCHAR(20) NOT NULL DEFAULT 'left',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AboutSection_isActive_orderIndex_idx`(`isActive`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `location` VARCHAR(500) NULL,
    `format` ENUM('ONLINE', 'IN_PERSON', 'HYBRID') NOT NULL DEFAULT 'IN_PERSON',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `timeZone` VARCHAR(100) NOT NULL DEFAULT 'Asia/Jakarta',
    `price` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `quota` INTEGER NULL,
    `externalUrl` VARCHAR(500) NULL,
    `registrationType` ENUM('INTERNAL', 'EXTERNAL') NOT NULL DEFAULT 'INTERNAL',
    `coverImage` VARCHAR(500) NULL,
    `publicId` VARCHAR(255) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publisherType` ENUM('PLATFORM', 'PROFESSIONAL', 'CARE_CENTRE') NOT NULL DEFAULT 'PLATFORM',
    `professionalId` INTEGER NULL,
    `careCentreId` INTEGER NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `categoryId` INTEGER NOT NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Event_slug_key`(`slug`),
    INDEX `Event_professionalId_status_startDate_idx`(`professionalId`, `status`, `startDate`),
    INDEX `Event_careCentreId_status_startDate_idx`(`careCentreId`, `status`, `startDate`),
    INDEX `Event_categoryId_status_idx`(`categoryId`, `status`),
    INDEX `Event_status_startDate_idx`(`status`, `startDate`),
    INDEX `Event_deletedAt_idx`(`deletedAt`),
    INDEX `Event_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventFocusArea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventFocusArea_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventFocusAreaMap` (
    `eventId` INTEGER NOT NULL,
    `focusAreaId` INTEGER NOT NULL,

    INDEX `EventFocusAreaMap_focusAreaId_idx`(`focusAreaId`),
    PRIMARY KEY (`eventId`, `focusAreaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventAgendaItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventAgendaItem_eventId_startTime_idx`(`eventId`, `startTime`),
    INDEX `EventAgendaItem_eventId_sortOrder_idx`(`eventId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Industry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Industry_name_key`(`name`),
    UNIQUE INDEX `Industry_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventIndustry` (
    `eventId` INTEGER NOT NULL,
    `industryId` INTEGER NOT NULL,

    INDEX `EventIndustry_industryId_idx`(`industryId`),
    PRIMARY KEY (`eventId`, `industryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NULL,
    `coverImage` VARCHAR(500) NULL,
    `type` ENUM('BLOG', 'NEWS') NOT NULL,
    `category` ENUM('CORPORATE', 'EXECUTIVE', 'INSIGHT', 'UPDATE', 'EVENT') NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Article_publicId_key`(`publicId`),
    UNIQUE INDEX `Article_slug_key`(`slug`),
    INDEX `Article_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Article_category_status_idx`(`category`, `status`),
    INDEX `Article_type_status_idx`(`type`, `status`),
    INDEX `Article_isFeatured_status_idx`(`isFeatured`, `status`),
    INDEX `Article_deletedAt_idx`(`deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `status` ENUM('PENDING', 'PAID', 'EXPIRED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `invoiceId` VARCHAR(255) NULL,
    `invoiceUrl` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,

    UNIQUE INDEX `Order_invoiceId_key`(`invoiceId`),
    INDEX `Order_userId_status_idx`(`userId`, `status`),
    INDEX `Order_eventId_status_idx`(`eventId`, `status`),
    INDEX `Order_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentLog` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELED', 'REFUNDED') NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentLog_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `PaymentLog_provider_status_idx`(`provider`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `attendeeName` VARCHAR(255) NOT NULL,
    `attendeeEmail` VARCHAR(255) NOT NULL,
    `attendeePhone` VARCHAR(50) NULL,
    `attendeeData` JSON NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `qrCode` TEXT NULL,
    `isCheckedIn` BOOLEAN NOT NULL DEFAULT false,
    `checkedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ticket_code_key`(`code`),
    INDEX `Ticket_orderId_idx`(`orderId`),
    INDEX `Ticket_attendeeEmail_idx`(`attendeeEmail`),
    INDEX `Ticket_isCheckedIn_checkedAt_idx`(`isCheckedIn`, `checkedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventAttendeeField` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` INTEGER NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `type` ENUM('TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'DATE', 'SELECT') NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `options` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventAttendeeField_eventId_sortOrder_idx`(`eventId`, `sortOrder`),
    UNIQUE INDEX `EventAttendeeField_eventId_key_key`(`eventId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('UNREAD', 'READ', 'REPLIED') NOT NULL DEFAULT 'UNREAD',
    `repliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactMessage_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Professional` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `slug` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `credentials` VARCHAR(255) NOT NULL,
    `profession` ENUM('PSIKOLOG', 'PSIKIATER', 'KONSELOR') NOT NULL,
    `headline` VARCHAR(500) NOT NULL,
    `bio` TEXT NULL,
    `photoUrl` VARCHAR(500) NULL,
    `publicId` VARCHAR(255) NULL,
    `baseCity` VARCHAR(100) NOT NULL,
    `baseProvince` VARCHAR(100) NOT NULL,
    `languages` JSON NULL,
    `yearsOfExperience` INTEGER NOT NULL DEFAULT 0,
    `startingPriceIdr` INTEGER NULL,
    `listingStatus` ENUM('PENDING', 'LISTED', 'REJECTED', 'APPROVED', 'PUBLISHED', 'DRAFT') NOT NULL DEFAULT 'PENDING',
    `verificationReview` ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED') NOT NULL DEFAULT 'NONE',
    `verificationCheckedOn` DATETIME(3) NULL,
    `verificationValidUntil` DATETIME(3) NULL,
    `verificationSource` ENUM('SUBMISSION', 'REGISTRY') NULL,
    `verificationAdminId` INTEGER NULL,
    `verificationNote` VARCHAR(500) NULL,
    `licenceType` VARCHAR(100) NULL,
    `licenceNumber` VARCHAR(100) NULL,
    `licenceValidUntil` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Professional_userId_key`(`userId`),
    UNIQUE INDEX `Professional_slug_key`(`slug`),
    INDEX `Professional_listingStatus_deletedAt_idx`(`listingStatus`, `deletedAt`),
    INDEX `Professional_profession_idx`(`profession`),
    INDEX `Professional_baseCity_idx`(`baseCity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfessionalService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `professionalId` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `mode` ENUM('ONLINE', 'IN_PERSON') NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 60,
    `priceIdr` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProfessionalService_professionalId_idx`(`professionalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AreaOfSupport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AreaOfSupport_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfessionalAreaOfSupport` (
    `professionalId` INTEGER NOT NULL,
    `areaId` INTEGER NOT NULL,

    INDEX `ProfessionalAreaOfSupport_areaId_idx`(`areaId`),
    PRIMARY KEY (`professionalId`, `areaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_resetPasswordToken_key` ON `User`(`resetPasswordToken`);

-- CreateIndex
CREATE INDEX `User_role_isActive_idx` ON `User`(`role`, `isActive`);

-- CreateIndex
CREATE INDEX `User_deletedAt_idx` ON `User`(`deletedAt`);

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_phonenumber_key` TO `User_phoneNumber_key`;

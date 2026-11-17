CREATE TABLE `EventSponsor` (
  `id`            INTEGER NOT NULL AUTO_INCREMENT,
  `eventId`       INTEGER NOT NULL,
  `tierId`        INTEGER NOT NULL,
  `name`          VARCHAR(150) NOT NULL,
  `logoUrl`       VARCHAR(500) NOT NULL,
  `logoPublicId`  VARCHAR(255) NOT NULL,
  `websiteUrl`    VARCHAR(500) NULL,
  `isActive`      BOOLEAN NOT NULL DEFAULT true,
  `sortOrder`     INTEGER NOT NULL DEFAULT 0,
  `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     DATETIME(3) NOT NULL,

  INDEX `EventSponsor_tierId_idx`(`tierId`),
  INDEX `EventSponsor_eventId_isActive_tierId_sortOrder_idx`(`eventId`, `isActive`, `tierId`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EventSponsor` ADD CONSTRAINT `EventSponsor_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EventSponsor` ADD CONSTRAINT `EventSponsor_tierId_fkey`
    FOREIGN KEY (`tierId`) REFERENCES `EventSponsorTier`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

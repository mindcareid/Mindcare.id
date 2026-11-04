ALTER TABLE `EventSponsorApplication` DROP FOREIGN KEY `EventSponsorApplication_eventId_fkey`;
ALTER TABLE `EventSponsorTier` DROP FOREIGN KEY `EventSponsorTier_eventId_fkey`;

ALTER TABLE `EventSponsorTier` ADD CONSTRAINT `EventSponsorTier_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EventSponsorApplication` ADD CONSTRAINT `EventSponsorApplication_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

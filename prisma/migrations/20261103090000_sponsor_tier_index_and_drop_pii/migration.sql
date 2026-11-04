CREATE INDEX `EventSponsorApplication_tierId_idx` ON `EventSponsorApplication`(`tierId`);

ALTER TABLE `EventSponsorApplication`
    DROP COLUMN `ip`,
    DROP COLUMN `userAgent`;

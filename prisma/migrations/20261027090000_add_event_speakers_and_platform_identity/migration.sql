-- Speaker & agenda event MindCare, plus identitas visual akun platform.
-- Rancangan: design.md bagian 33.

-- ============================================================
-- 1. Identitas akun platform (MindCare.id)
-- ============================================================
-- Logo dan publicId wajib berpasangan; dijaga di API, bukan constraint.
ALTER TABLE `Platform` ADD COLUMN `logoUrl` VARCHAR(500) NULL;
ALTER TABLE `Platform` ADD COLUMN `logoPublicId` VARCHAR(255) NULL;

-- Badge "Official MindCare". Satu-satunya baris di tabel ini adalah akun
-- MindCare sendiri, jadi default true benar untuk baris yang sudah ada.
ALTER TABLE `Platform` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT true;

-- ============================================================
-- 2. Jenis sesi agenda
-- ============================================================
-- DEFAULT 'TALK' supaya 36 baris agenda lama (dan agenda listing profesional/
-- care centre) valid tanpa backfill. Nilai ini tidak dirender untuk event
-- yang bukan PLATFORM.
ALTER TABLE `EventAgendaItem` ADD COLUMN `kind`
    ENUM('OPENING', 'KEYNOTE', 'PANEL', 'TALK', 'DISCUSSION', 'BREAK', 'OTHER')
    NOT NULL DEFAULT 'TALK';

-- Keterangan baris untuk sesi tanpa pembicara (OPENING/BREAK/OTHER).
ALTER TABLE `EventAgendaItem` ADD COLUMN `attendees` TEXT NULL;

-- ============================================================
-- 3. Speaker milik satu event
-- ============================================================
CREATE TABLE `EventSpeaker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NULL,
    `titleLines` TEXT NULL,
    `photoUrl` VARCHAR(500) NULL,
    `photoPublicId` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EventSpeaker_eventId_name_key`(`eventId`, `name`),
    INDEX `EventSpeaker_eventId_sortOrder_idx`(`eventId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 4. Pengikat sesi agenda ke speaker
-- ============================================================
-- Boleh banyak speaker per sesi (panel), dan satu speaker di beberapa sesi.
CREATE TABLE `EventAgendaSpeaker` (
    `agendaItemId` INTEGER NOT NULL,
    `speakerId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `EventAgendaSpeaker_speakerId_idx`(`speakerId`),
    PRIMARY KEY (`agendaItemId`, `speakerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- 5. Foreign key
-- ============================================================
-- Tambah FK sekaligus (bukan hanya di aplikasi) supaya baris speaker/pivot
-- tidak bisa yatim kalau event dihapus permanen. Event sendiri memakai soft
-- delete, jadi cascade di sini hanya jalan saat baris Event benar-benar
-- dihapus.
ALTER TABLE `EventSpeaker` ADD CONSTRAINT `EventSpeaker_eventId_fkey`
    FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EventAgendaSpeaker` ADD CONSTRAINT `EventAgendaSpeaker_agendaItemId_fkey`
    FOREIGN KEY (`agendaItemId`) REFERENCES `EventAgendaItem`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EventAgendaSpeaker` ADD CONSTRAINT `EventAgendaSpeaker_speakerId_fkey`
    FOREIGN KEY (`speakerId`) REFERENCES `EventSpeaker`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

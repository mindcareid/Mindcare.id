-- Audit log.
--
-- Menyimpan jejak perubahan yang dilakukan admin/superadmin: siapa, aksi apa,
-- pada entitas apa, nilai sebelum & sesudah (Json), plus konteks request.
-- Tabel append-only: aplikasi hanya INSERT, tidak pernah UPDATE/DELETE.

CREATE TABLE `AuditLog` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `actorId` INTEGER NULL,
  `actorName` VARCHAR(255) NULL,
  `actorRole` VARCHAR(20) NULL,
  `action` VARCHAR(20) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(64) NULL,
  `before` JSON NULL,
  `after` JSON NULL,
  `ip` VARCHAR(64) NULL,
  `userAgent` VARCHAR(500) NULL,
  `requestId` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
  INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
  INDEX `AuditLog_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

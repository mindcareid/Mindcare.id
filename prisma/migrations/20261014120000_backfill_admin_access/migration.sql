-- Backfill otorisasi admin.
--
-- Sebelum perubahan ini, status admin disimpan di `User.role`
-- (ADMIN/SUPERADMIN). Sejak sekarang otorisasi dibaca dari tabel
-- `AdminAccess`, jadi setiap akun yang masih berrole admin lama perlu
-- mendapat satu baris di sini supaya tidak kehilangan akses.
--
-- Idempoten: `INSERT IGNORE` memakai unique index `AdminAccess_userId_key`,
-- sehingga migrasi ini aman walau barisnya sudah ada.

INSERT IGNORE INTO `AdminAccess` (`userId`, `role`, `isActive`, `createdAt`, `updatedAt`)
SELECT `id`, `role`, true, NOW(3), NOW(3)
FROM `User`
WHERE `role` IN ('ADMIN', 'SUPERADMIN')
  AND `deletedAt` IS NULL;

-- Pastikan selalu ada minimal satu SUPERADMIN aktif supaya pengelolaan akses
-- admin tidak bisa terkunci (hanya SUPERADMIN yang boleh mengangkat/mencabut).
-- Kalau belum ada, admin aktif terlama dinaikkan jadi SUPERADMIN.
UPDATE `AdminAccess` AS a
JOIN (
  SELECT MIN(`id`) AS id
  FROM `AdminAccess`
  WHERE `isActive` = true
) AS first_admin ON first_admin.id = a.id
SET a.`role` = 'SUPERADMIN'
WHERE a.`isActive` = true
  AND NOT EXISTS (
    SELECT 1 FROM (
      SELECT `id`
      FROM `AdminAccess`
      WHERE `role` = 'SUPERADMIN' AND `isActive` = true
      LIMIT 1
    ) AS existing_superadmin
  );

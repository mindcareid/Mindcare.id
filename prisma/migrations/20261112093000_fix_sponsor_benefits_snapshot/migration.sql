-- Migration penyelamat untuk kolom `benefitsSnapshot`.
--
-- Kenapa ada migration ini?
-- `20261103093000_sponsor_benefits_snapshot` sudah tercatat "applied" di
-- _prisma_migrations produksi, tetapi kolomnya tidak ada di tabel
-- `EventSponsorApplication`. Penyebabnya: tabel pernah dibuat ulang dari
-- definisi lama setelah migration itu ditandai sukses, sehingga catatan
-- migration dan kondisi fisik tabel tidak lagi sinkron. Akibatnya
-- `prisma migrate deploy` menganggap semuanya beres, padahal Prisma Client
-- gagal dengan P2022 "The column `benefitsSnapshot` does not exist".
--
-- Migration ini sengaja ditulis idempotent: kalau kolom memang sudah ada,
-- SQL-nya tidak melakukan apa pun. Dengan begitu aman dijalankan pada
-- database yang sudah benar (staging, database baru hasil migrate ulang) —
-- di sana kolomnya sudah dibuat oleh migration aslinya.
--
-- Ikuti langkah ini jika menemukan P2022 untuk kolom ini di environment lain:
--   npx prisma migrate status
--   npx prisma migrate deploy

SET @column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'EventSponsorApplication'
    AND COLUMN_NAME = 'benefitsSnapshot'
);

SET @stmt := IF(
  @column_exists = 0,
  'ALTER TABLE `EventSponsorApplication` ADD COLUMN `benefitsSnapshot` JSON NULL',
  'DO 0'
);

PREPARE add_benefits_snapshot FROM @stmt;
EXECUTE add_benefits_snapshot;
DEALLOCATE PREPARE add_benefits_snapshot;

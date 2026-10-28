-- Peran speaker **per sesi** (design.md bagian 33).
--
-- Satu orang bisa jadi moderator di satu sesi dan pembicara di sesi lain, jadi
-- peran disimpan di pivot sesi<->speaker, bukan di tabel speaker.
--
-- Additive & aman: kolom baru berdefault 'SPEAKER', sehingga semua baris pivot
-- yang sudah ada otomatis berarti "pembicara biasa" tanpa backfill. Revert kode
-- cukup mengabaikan kolom ini.
ALTER TABLE `EventAgendaSpeaker`
    ADD COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'SPEAKER';

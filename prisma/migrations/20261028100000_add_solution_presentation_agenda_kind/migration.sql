-- Jenis sesi baru: `SOLUTION_PRESENTATION` (design.md bagian 33).
--
-- Dipakai acara yang menampilkan solusi/produk mitra. Sesi ini menyebut orang
-- (pemapar), jadi perilakunya sama dengan TALK/PANEL.
--
-- Ditaruh setelah `PANEL`, bukan di akhir, supaya urutan pilihan di form admin
-- (?MySQL menyimpan enum sesuai urutan deklarasi) tetap masuk akal: sesi isi
-- materi berdekatan.
--
-- Additive: hanya menambah nilai. Baris lama dengan nilai lain tidak berubah,
-- dan kode lama tetap jalan (nilai baru tidak dikenalnya, tapi tidak ada baris
-- lama yang memakainya).
ALTER TABLE `EventAgendaItem`
    MODIFY `kind`
    ENUM('OPENING', 'KEYNOTE', 'PANEL', 'SOLUTION_PRESENTATION', 'TALK', 'DISCUSSION', 'BREAK', 'OTHER')
    NOT NULL DEFAULT 'TALK';

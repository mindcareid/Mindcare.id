# Changelog

A running record of changes made to this repository outside the product's own
feature work, grouped by date. Each entry names the files touched and why, so a
later reader can see what moved and can revert a single concern.

---

## 2026-10-28

### Agenda event publik: jadwal per hari

Agenda di `/events/<slug>` diubah dari daftar rata menjadi jadwal yang
dikelompokkan per hari, dengan kolom jam tetap, titik dan garis penghubung, dan
label jenis sesi. Tanggal sesi yang diisi admin sebelumnya tidak pernah tampil;
sekarang menjadi pemisah utama.

| File | Change |
|---|---|
| `app/(user)/events/section/EventAgenda.tsx` | Dikelompokkan per hari (`Intl` zona acara), kolom jam `tabular-nums`, titik + garis timeline, jenis sesi berwarna `brand-emerald-700`, jam selesai sebagai `until HH:MM`, nama pembicara dikelompokkan per peran |
| `design.md` 33.6b | Alasan per keputusan desain (R-31), Design Read, dial, dan pengukuran kontras |

Dikerjakan dengan skill antislop mode `during`. Yang sengaja tidak dibuat:
carousel speaker, karena menyembunyikan kartu membuat tautan `#speaker-<id>`
kehilangan tujuan dan halaman ini tanpa JavaScript client.

Verifikasi: `tsc --noEmit` bersih, `next build` sukses (125 halaman),
`check-tailwind-classes` LOLOS (327 kelas / 32 file), halaman detail event
dirender `200 OK` dengan agenda lengkap (8 sesi, 1 grup hari, 9 anchor speaker),
kontras teks 5.69:1 sampai 14.87:1.

---

## 2026-10-27

### Speaker & agenda event MindCare, identitas akun platform

Kartu host event admin sekarang bisa memakai logo MindCare dan badge "Official
MindCare". Event yang diterbitkan MindCare juga punya daftar speaker dan
susunan acara yang lebih kaya: jam, jenis sesi, judul, dan siapa yang bicara.
Nama pembicara di susunan acara menaut ke kartunya di halaman yang sama.

Rancangan dan alasannya: `design.md` bagian 33. Aturan umumnya masuk
`rules.md` pasal 4. Event profesional/care centre **tidak berubah**.

| File | Change |
|---|---|
| `prisma/schema.prisma` | `Platform.logoUrl`/`logoPublicId`/`isVerified`; enum `EventAgendaKind`; `EventAgendaItem.kind` + `attendees`; model `EventSpeaker` (termasuk `titleLines`) dan pivot `EventAgendaSpeaker` |
| `prisma/migrations/20261027090000_add_event_speakers_and_platform_identity/` | Migrasi additif: kolom baru berdefault, dua tabel baru, tiga FK cascade manual |
| `lib/cloudinary/types/upload.ts`, `lib/cloudinary/folders.ts` | Folder `platform` (`app_data/Platform`, admin only) |
| `app/api/cadmin/platform/route.ts` | `PUT` menerima logo + `isVerified`; pasangan logo setengah ditolak `422`; `try/catch` |
| `app/cadmin/platform/page.tsx`, `PlatformForm.tsx` | Unggah logo (1:1, 512px, `deferDelete`), checkbox badge |
| `app/api/cadmin/events/route.ts` | Parser + penulis `speakers[]`/`agenda[]`; kunci tautan `clientKey`; pasangan wajib; jenis sesi tanpa pembicara ditolak bila punya pembicara atau tanpa baris keterangan; hanya untuk event `PLATFORM` |
| `app/api/cadmin/events/[id]/route.ts` | `GET` menyertakan speaker + agenda + pivot |
| `app/cadmin/events/components/AgendaSpeakersEditor.tsx` | Baru. Dua daftar dalam satu state, pilih speaker per sesi lewat checkbox |
| `app/cadmin/events/components/EventForm.tsx` | Bagian Speaker & Schedule (hanya `PLATFORM`), validasi, payload berpasangan |
| `app/(user)/events/data/events.ts` | `speakers` + pivot di include detail; `EventHost.logoUrl`/`isVerified` |
| `app/(user)/events/section/EventHostCard.tsx` | Cabang host `PLATFORM`: logo, nama, badge |
| `app/(user)/events/section/EventAgenda.tsx` | Label jenis sesi + nama pembicara sebagai anchor, hanya untuk `PLATFORM` |
| `app/(user)/events/section/EventSpeakers.tsx` | Baru. Daftar kartu speaker ber-`id="speaker-<id>"` |
| `app/(user)/events/[slug]/EventDetail.tsx` | Merender daftar speaker; tautan dimatikan untuk event yang sudah lewat |
| `lib/events/agenda.ts` | Baru. Taksonomi jenis sesi (label + "tidak menyebut orang") yang dipakai admin, API, dan halaman publik sekaligus |

Satu ronde review atas perubahan ini menemukan dan memperbaiki: tanggal sesi yang
sebelumnya menempel ke `startDate` (acara dua hari jadi tidak bisa dicatat),
rename speaker yang bentrok jadi 500, foto speaker menerima URL domain apa pun,
taksonomi jenis sesi yang bercabang tiga, aset Cloudinary terhapus walau form
dibatalkan, pivot yang hanya dibersihkan lewat FK manual, `DELETE` yang
melaporkan sukses untuk id tak dikenal, dan `EventHost` yang mengisi logo/badge
tanpa melihat `publisherType`. Rinciannya di `design.md` 33.10.

Tambahan 28 Oktober 2026: jenis sesi **Solution presentation**
(`SOLUTION_PRESENTATION`) untuk acara yang menampilkan solusi mitra; disebut
orang seperti Talk/Panel. Migrasi: `20261028100000_add_solution_presentation_agenda_kind`.

Tambahan UI 28 Oktober 2026: form admin event sekarang memakai **kartu lipat**
untuk speaker & sesi (satu kartu terbuka sekaligus), tombol urutan ↑ ↓, **action
bar lengket** dengan penghitung jumlah, dan **panel validasi** yang menggantikan
`alert()` — semua masalah tampil sekaligus dan bisa diklik untuk membuka kartu
yang salah. Rincian & alasan di `design.md` 33.5b.

Tambahan 28 Oktober 2026: **peran per sesi** (Speaker / Moderator / Panelist /
Host) dan **opening boleh punya pembicara**. Peran disimpan di pivot
`EventAgendaSpeaker.role` karena melekat pada sesi, bukan pada orang; maksimal
satu moderator per sesi. Muatan API `speakerKeys: string[]` menjadi
`speakers: { key, role }[]` (bentuk lama tetap diterima sebagai `SPEAKER`).
Migrasi baru: `20261028090000_add_agenda_speaker_role`.

Perbaikan 28 Oktober 2026 ("5 sesi padahal sudah 7"): setelah simpan, form
mengambil ulang data dari API (`cache: "no-store"`) dan memasangnya ke state,
menggantikan pola `router.refresh()` + `router.push()` yang merupakan race
dengan cache router. Menyimpan event yang sudah ada kini tetap di halaman edit
dengan notifikasi "Saved", bukan dilempar ke daftar. Rincian di `design.md` 33.5f.

Perbaikan tampilan basi 28 Oktober 2026: `EventForm` tidak lagi memakai
`useEffect` untuk menyalin `defaultValues` ke state. State diinisialisasi lewat
lazy initializer, dan `EventFormWrapper` me-remount form lewat `key` turunan isi
data server — jadi tab lama langsung menampilkan data setelah simpan, tanpa
menimpa isian yang sedang diketik. Halaman edit juga ditandai
`force-dynamic`. Efek samping: error eslint lama `set-state-in-effect` di file
itu ikut hilang. Rincian di `design.md` 33.5e.

Perbaikan **akar masalah** 28 Oktober 2026: `parseAgenda` membaca
`row.speakerKeys` (field lama) padahal klien mengirim `row.speakers`, sehingga
centangan speaker di sesi selalu dibuang dan pivot tersimpan 0 baris — gejalanya
"speaker tersimpan tapi sesi kosong". Sekarang `row.speakers` dibaca lebih dulu,
`speakerKeys` hanya cadangan. Ikut diperbaiki: prefix ganda pada kunci kartu sesi
(`agenda-agenda-1`) yang membuat penanda error tidak cocok. Rincian di
`design.md` 33.5d.

Perbaikan bug 28 Oktober 2026 ("speaker yang baru ditambahkan hilang"): (1)
`clientKey` kini selalu string, termasuk dari id number — sebelumnya simpan
kedua kali ditolak `422`; (2) `useEffect` form event tidak lagi menimpa state
speaker/sesi saat `defaultValues`/`categories` berganti referensi; (3)
`router.refresh()` setelah simpan supaya tombol Back tidak menampilkan data
sebelum simpan. Rincian di `design.md` 33.5c.

Perbaikan 28 Oktober 2026 (lanjutan): pesan `Session 1: pick a date between
2026-11-28 and 2026-11-27` dan semua tanggal abu-abu di date picker berasal dari
**End Date event yang lebih awal dari Start Date**, bukan dari batas sesi. Start/End
Date sekarang diperiksa lebih dulu untuk semua event, pesannya menyebut kedua nilai,
dan input End Date langsung ditandai merah (plus `min`) saat rentangnya terbalik.

Perbaikan 28 Oktober 2026 (dari laporan diaze: "sesi tidak bisa diset 28
November padahal event 28 Oktober"): batas tanggal sesi memang tanggal acara dan
tetap dipertahankan. Yang salah adalah validasinya — sesi dengan tanggal kosong
dilewati (`item.date && …`), dan pesan "must fall within the event dates" tidak
menyebut tanggal acara sama sekali, sehingga salah isi tanggal event tidak
terlihat. Sekarang tanggal kosong ditolak, dan pesan menyebut rentang tanggal
yang berlaku di klien maupun server.

Temuan terpisah, **tidak** diperbaiki di sini: dua route
`/api/cadmin/events/[id]/attendee-fields` tidak memanggil guard admin
(catatannya di `design.md` 33.12).

Verifikasi: `tsc --noEmit` bersih · eslint bersih pada berkas yang diubah ·
`check-tailwind-classes` LOLOS untuk `app/(user)/events`, `app/cadmin/events`,
`app/cadmin/platform`. **Migrasi belum diterapkan** (database tidak terjangkau
dari sesi ini) dan **runtime belum diuji**.

---

## 2026-10-21

### Homepage hero slideshow

Added an image slideshow with a wipe transition to the homepage hero, managed
from the admin console.

| File | Change |
|---|---|
| `app/components/reusable/HeroWipeSlideshow.tsx` | New. Slide renderer, transform-only wipe, autoplay with pause, keyboard support, reduced-motion crossfade, `next/image` layers |
| `app/(user)/page.tsx` | Reads active `HeroSlider` rows and maps them to slides |
| `app/(user)/home/Home.tsx` | Renders the slideshow when slides exist, otherwise the previous `PageHero` |
| `app/components/SideMenuAdmin.tsx` | Added the "Hero Slides" entry under a new "Content" section |
| `app/cadmin/hero/components/HeroForm.tsx` | Rewritten to the admin design system; uses `ImageUploadField`; Title, Description, Alt text, Button, Order, Visibility |
| `app/cadmin/hero/components/HeroList.tsx` | Rewritten as a card list with thumbnail, status, edit and delete |
| `app/cadmin/hero/page.tsx`, `create/page.tsx`, `edit/[id]/page.tsx` | Page shells, loading and error states |
| `app/components/reusable/ImageUploadField.tsx` | Added opt-in `deferDelete` and `onDiscard` props |
| `prisma/schema.prisma` | No change. Existing `HeroSlider` fields `title`, `subtitle`, `description`, `alignText` are reused; `subtitle` now holds alt text |

Also fixed: updating a slide previously sent no `id` in the request body, while
`PUT /api/hero` requires it, so every edit failed with a 400.

Documentation for this area: `docs/hero-carousel.md`.

### Homepage content

| File | Change |
|---|---|
| `app/(user)/home/section/AboutPlatform.tsx` | New. Short introduction to the platform, plus what the licence-check labels mean |
| `app/(user)/home/Home.tsx` | Added the intro section; passed homepage-specific empty states; fixed the lowercase "solutions" heading; removed two mangled dashes |
| `app/(user)/components/Footer.tsx` | Replaced the paragraph describing an exhibition and conference with an accurate description of the directory; fixed a mangled copyright sign |
| `app/(user)/professionals/section/ProfessionalsGrid.tsx` | Optional `emptyState` prop; copy no longer talks about filters on the homepage |
| `app/(user)/care-centres/section/CareCentresGrid.tsx` | Same, plus fixed a sentence missing its punctuation |
| `app/(user)/solutions/section/SolutionsGrid.tsx` | Same optional prop |
| `app/(user)/events/section/EventsCardGrid.tsx` | Same optional prop |
| `app/(user)/help/report-concern/page.tsx` | Fixed a mangled dash |

### Homepage intro section, second pass

The first version of the intro section was two plain text columns. It was
rebuilt to carry more depth and to hold up across widths.

| File | Change |
|---|---|
| `app/(user)/home/section/AboutPlatform.tsx` | Rewritten: tinted lavender band, three seeker-facing points with relevant icons, an offset layer behind the label panel for depth, three responsive states (one column, points in two columns, asymmetric two columns with the panel) |

Decisions and why:

- The tinted band breaks the run of white sections, which is the cheapest way to
  add rhythm without introducing an asset.
- No new imagery: an image here would have to be invented, and the section works
  from real content (the verification labels come from `VERIFICATION_LABELS`).
- No scroll animation. Motion is the hero's job on this page, and the remaining
  sections are static; adding motion to one more section would read as a
  template move rather than a decision.


### Ticket email QR code

The ticket email showed the caption "Present this QR Code at the check-in desk"
with no image. The email `Image` component emitted a React-style `<Image>` tag
into an HTML string, which no mail client renders.

| File | Change |
|---|---|
| `lib/mail/components/Image.ts` | Emits a real `<img>` with fixed dimensions |
| `lib/mail/templates/ticket.ts` | Uses the stored QR data URL via `cid:` when available, otherwise the `/api/tickets/qr/{code}` URL |
| `lib/mail/senders/ticket.ts` | Attaches the QR inline with a content id |
| `lib/mail/types.ts`, `lib/orders/sendTicketEmails.ts` | Pass the stored QR data URL through |

---

## Encoding defect, not yet fixed

Source files contain double-encoded UTF-8, which the browser renders as
garbage. Confirmed examples:

- `app/(user)/components/Footer.tsx` (fixed here)
- `app/(user)/home/Home.tsx` (fixed here)
- `app/(user)/help/report-concern/page.tsx` (fixed here)
- `app/(user)/help/verification-policy/page.tsx`, `app/(user)/help/section/NotPublishedYet.tsx`, `app/(user)/care-centres/*`, `app/(user)/events/*`, `app/(user)/insights/data/articles.ts` and others

A scan across `app/` and `lib/` found roughly 240 lines carrying the sequences
`a-circumflex + euro + smart-quote`, `a-circumflex + euro + trademark`, and
`A-circumflex + copyright-sign`. They should be repaired file by file with a
UTF-8 safe editor, not by a string-replacement script, because rewriting a file
with the wrong encoding can damage the rest of its content.

---

## Dead legacy files from another product

These files belong to a different brand (Execorner) and are imported by nothing.
They were found while working on the homepage and left in place because deleting
them is the repository owner's decision.

| File | Problem |
|---|---|
| `app/(user)/section/AboutSection.tsx` | Execorner copy, `/images/HRDI.jpg`, hardcoded statistics (10000 professionals, 500 events, 100 experts) |
| `app/(user)/section/VisionSection.tsx` | Execorner copy, hardcoded DM Sans and Playfair Display |
| `app/(user)/section/PartnerSection.tsx` | Execorner partner section |
| `app/(user)/section/HeroSection.tsx` | Scratch file with demo buttons ("Simpan", "Clear", "spam", "Hapus") and an "Upcoming Events" heading |
| `app/(user)/section/ContactSection.tsx` | Unused; the homepage uses `app/(user)/home/section/ContactSection.tsx` |
| `app/(user)/components/CountUp.tsx` | Only used by the dead `AboutSection` |
| `public/images/HRDI.jpg` | Image of the other brand |

Two risks if any of this is ever wired up by mistake: another company's branding
appears on MindCare, and the invented statistics violate the project rule
against numbers without a real source.


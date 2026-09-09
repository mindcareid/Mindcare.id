// Daftar topik untuk halaman /help. Bedanya dengan file data lain di repo ini:
// isinya BUKAN karangan. Setiap entri menunjuk halaman yang benar-benar ada di
// repo ini, atau dokumen yang memang direncanakan dan ditandai `draft`.
//
// Satu pantangan yang HARUS dipertahankan di file ini: `summary` untuk entri
// `draft` hanya boleh menyebut CAKUPAN dokumennya — jangan pernah menuliskan
// klausul, janji, atau kewajiban hukum yang belum ada dokumennya. Menulis
// "kami tidak menjual data Anda" di ringkasan Privacy Policy yang belum
// diterbitkan sama saja menerbitkan klausul lewat pintu belakang, dan yang
// terikat olehnya bukan saya. Aturan yang sama sudah ditulis di `rules.md`
// pasal 10.
//
// Catatan nilai turunan (jangan diubah sepihak, ada harness yang menjaganya —
// `scripts/check-data-invariants.mjs`):
//
// 1. `path` DISIMPAN, tidak diturunkan dari `slug`. Kelompok `using-mindcare`
//    menunjuk ke luar /help (mis. /professionals), jadi rumus
//    `/help/${slug}` akan salah untuk separuh entri.
// 2. Untuk `status: "published"`, harness memeriksa KE DISK bahwa
//    `app/(user)<path>/page.tsx` benar-benar ada. Dengan begitu tautan mati
//    gagal di verifikasi, bukan ketemu waktu ada yang kebetulan mengklik.
// 3. Untuk `status: "draft"`, harness memastikan halamannya memang belum ada
//    ATAU isinya placeholder (`NotFound` / `NotPublishedYet`). Kalau suatu hari
//    dokumennya sudah betulan ditulis tapi statusnya lupa dinaikkan, harness
//    yang mengingatkan.
// 4. `slug` dan `path` wajib unik — itu dijaga harness. Sedangkan `icon`,
//    `group`, dan `status` TIDAK dicek harness dan memang tidak perlu:
//    ketiganya union bertipe di `../type/helpTopic` dan array ini
//    dideklarasikan `HelpTopic[]`, jadi salah tulis satu huruf sudah dijegal
//    `tsc`. Mengulanginya di harness cuma menambah tempat yang harus disamakan.
//
// Urutan array = urutan tampil. Kelompok `using-mindcare` dulu karena orang yang
// membuka /help umumnya sedang mencari bantuan, bukan sedang membaca ketentuan.

import type { HelpTopic, HelpTopicGroup } from "../type/helpTopic";

const helpTopics: HelpTopic[] = [
  {
    id: "help-01",
    slug: "find-a-professional",
    title: "Find a professional",
    summary:
      "Cari psikolog, psikiater, atau konselor, dan baca dulu apa yang jadi fokus penanganannya.",
    path: "/professionals",
    group: "using-mindcare",
    icon: "people",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-02",
    slug: "find-a-care-centre",
    title: "Find a care centre",
    summary:
      "Telusuri klinik, rumah sakit, dan pusat konseling per kota, lengkap dengan jam layanannya.",
    path: "/care-centres",
    group: "using-mindcare",
    icon: "hospital",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-03",
    slug: "explore-solutions",
    title: "Explore solutions",
    summary:
      "Lihat bentuk-bentuk pendampingan yang terdaftar di MindCare dan apa saja isinya.",
    path: "/solutions",
    group: "using-mindcare",
    icon: "sparkle",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-04",
    slug: "join-an-event",
    title: "Join an event",
    summary:
      "Temukan sesi bicara, lokakarya, dan kelompok dukungan, beserta siapa yang menyelenggarakannya.",
    path: "/events",
    group: "using-mindcare",
    icon: "calendar",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-05",
    slug: "read-insights",
    title: "Read insights",
    summary:
      "Bacaan untuk orang yang sedang mencari bantuan, dan untuk orang-orang di sekitarnya.",
    path: "/insights",
    group: "using-mindcare",
    icon: "article",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-06",
    slug: "verification-policy",
    title: "Verification Policy",
    summary:
      "Apa arti badge Verified, bagaimana kami memeriksanya, dan kapan hasil pemeriksaan itu kedaluwarsa.",
    path: "/help/verification-policy",
    group: "legal-safety",
    icon: "verified",
    status: "published",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-07",
    slug: "terms-of-service",
    title: "Terms of Service",
    summary: "Ketentuan pemakaian MindCare.",
    path: "/help/terms-of-service",
    group: "legal-safety",
    icon: "document",
    status: "draft",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-08",
    slug: "privacy-policy",
    title: "Privacy Policy",
    summary: "Bagaimana MindCare memperlakukan data yang Anda berikan.",
    path: "/help/privacy-policy",
    group: "legal-safety",
    icon: "lock",
    status: "draft",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-09",
    slug: "disclaimer",
    title: "Disclaimer",
    summary:
      "Kenapa sebuah profil di MindCare bukan rujukan medis dan bukan pengganti pemeriksaan.",
    path: "/help/disclaimer",
    group: "legal-safety",
    icon: "info",
    status: "draft",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
  {
    id: "help-10",
    slug: "report-concern",
    title: "Report a Concern",
    summary:
      "Cara memberi tahu kami kalau ada profil yang keliru atau terasa tidak aman.",
    path: "/help/report-concern",
    group: "legal-safety",
    icon: "flag",
    status: "draft",
    createdAt: "2026-08-26T02:00:00.000Z",
  },
];

export async function getHelpTopics(): Promise<HelpTopic[]> {
  return helpTopics;
}

export async function getHelpTopicsByGroup(
  group: HelpTopicGroup,
): Promise<HelpTopic[]> {
  return helpTopics.filter((topic) => topic.group === group);
}

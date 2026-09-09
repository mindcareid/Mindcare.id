// Kontrak data untuk kartu di halaman /help.
//
// Satu hal yang perlu dijelaskan di sini karena tidak kelihatan dari nama
// fieldnya: `icon` menyimpan NAMA ikon, bukan komponennya. Alasannya dua.
// Pertama, data mock di repo ini dibaca ulang oleh harness `.mjs` dengan regex,
// jadi isinya wajib literal — komponen React bukan literal. Kedua, `data/` tetap
// bebas dari impor komponen, sehingga file datanya aman dipakai server maupun
// client. Pemetaan nama -> komponen tinggal di komponen yang merendernya, sama
// seperti `theme` di `solutions/type/solution.ts`.

export type HelpTopicGroup = "using-mindcare" | "legal-safety";

// "draft" berarti halamannya BELUM ADA atau belum berisi apa pun yang layak
// dibaca. Kartunya tetap tampil supaya orang tahu dokumen itu direncanakan, tapi
// tidak bisa diklik. Tautan mati di direktori kesehatan mental lebih buruk
// daripada kartu diam.
export type HelpTopicStatus = "published" | "draft";

export type HelpTopicIcon =
  | "people"
  | "hospital"
  | "sparkle"
  | "calendar"
  | "article"
  | "verified"
  | "document"
  | "lock"
  | "info"
  | "flag";

export interface HelpTopic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  path: string;
  group: HelpTopicGroup;
  icon: HelpTopicIcon;
  status: HelpTopicStatus;
  createdAt: string;
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  Hospital,
  Info,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  FileText,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import { cn } from "@/lib/utils";
import { getHelpTopicsByGroup } from "./data/helpTopics";
import type { HelpTopic, HelpTopicIcon } from "./type/helpTopic";

// Halaman /help versi MindCare. Ditulis ulang 26 Agustus 2026 menggantikan
// halaman Executive Corner yang ada di sini sebelumnya.
//
// TIGA HAL YANG MENENTUKAN BENTUK HALAMAN INI:
//
//   1. Kartu untuk dokumen yang belum ada TIDAK BISA DIKLIK. Ini keputusan
//      diaze, dan alasannya penting: dari lima tautan "Legal & Safety" di
//      footer, empat belum punya isi. Kalau kartunya bisa diklik, /help berubah
//      dari satu tautan mati jadi empat tautan mati yang lebih mudah ditemukan.
//      Yang paling tidak boleh menggantung adalah "Report a Concern" — orang
//      yang mengkliknya kemungkinan besar sedang melaporkan sesuatu yang
//      membahayakan. Presedennya sudah ada: kartu klinik penyelenggara di
//      halaman event juga sengaja tidak bisa diklik selama rutenya belum ada.
//   2. Statusnya datang dari data, bukan dari mata. `status: "draft"` di
//      `data/helpTopics.ts` yang menentukan kartunya mati, dan harness
//      `check-data-invariants.mjs` memeriksa ke disk apakah halaman untuk entri
//      `published` benar-benar ada. Jadi tautan mati gagal di verifikasi, bukan
//      ketemu waktu ada yang mengklik.
//   3. Tidak ada warna per kartu. Halaman lama punya `colorMap` enam warna
//      (empat di antaranya tidak dipakai) dari palet Tailwind mentah —
//      emerald/blue/amber/red/purple/teal — plus komentar "Grid 4 kolom, sama
//      persis seperti Gojek". Dua-duanya dibuang: warnanya melanggar larangan
//      palet mentah di `design.md`, dan meniru tata letak layanan lain bukan
//      alasan desain.
//
// Semuanya server component. Tidak ada `revalidate` karena tidak ada satu pun
// nilai di halaman ini yang bergantung pada "sekarang".

export const metadata: Metadata = {
  title: "Help Centre",
  description:
    "Where to start on Mindcare, and the documents that govern how the directory works.",
};

// Ikon disimpan sebagai NAMA di data (lihat catatan di `type/helpTopic.ts`),
// dipetakan ke komponennya di sini. Union `HelpTopicIcon` yang memaksa peta ini
// lengkap — menambah nama baru tanpa menambah barisnya akan gagal di `tsc`.
const ICONS: Record<HelpTopicIcon, LucideIcon> = {
  people: Users,
  hospital: Hospital,
  sparkle: Sparkles,
  calendar: CalendarDays,
  article: Newspaper,
  verified: ShieldCheck,
  document: FileText,
  lock: LockKeyhole,
  info: Info,
  flag: Flag,
};

const CARD_BASE =
  "flex h-full flex-col gap-3 rounded-xl border p-5 text-left";

function TopicBody({ topic }: { topic: HelpTopic }) {
  const Icon = ICONS[topic.icon];
  const draft = topic.status === "draft";

  return (
    <>
      <span
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-lg",
          draft
            ? "bg-muted text-muted-foreground"
            : "bg-brand-lavender-100 text-primary",
        )}
      >
        <Icon size={20} aria-hidden="true" />
      </span>

      <div className="flex items-center gap-2">
        <h3
          className={cn(
            "font-heading text-lg font-semibold leading-snug",
            draft ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {topic.title}
        </h3>
        {!draft && (
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="text-secondary transition-transform duration-300 group-hover:translate-x-1"
          />
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {topic.summary}
      </p>

      {draft && (
        <span className="mt-auto inline-flex w-fit items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Not published yet
        </span>
      )}
    </>
  );
}

function TopicCard({ topic }: { topic: HelpTopic }) {
  // Kartu draft dirender sebagai <div>, bukan <a> tanpa href atau <a> dengan
  // pointer-events-none. Alasannya aksesibilitas: keduanya masih diumumkan
  // sebagai tautan oleh screen reader, dan yang kedua masih bisa dicapai lewat
  // Tab. Kartu yang tidak menuju ke mana pun sebaiknya memang bukan tautan.
  if (topic.status === "draft") {
    return (
      <div className={cn(CARD_BASE, "border-dashed border-border bg-muted/40")}>
        <TopicBody topic={topic} />
      </div>
    );
  }

  return (
    <Link
      href={topic.path}
      className={cn(
        CARD_BASE,
        "group border-border bg-card shadow-card transition-shadow duration-300",
        "hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <TopicBody topic={topic} />
    </Link>
  );
}

function TopicGrid({ topics }: { topics: HelpTopic[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}

export default async function HelpPage() {
  const [directory, legal] = await Promise.all([
    getHelpTopicsByGroup("using-mindcare"),
    getHelpTopicsByGroup("legal-safety"),
  ]);

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Help Centre"
        title="Mulai dari mana?"
        subtitle="Halaman ini untuk dua keperluan: kalau Anda belum tahu harus mencari ke mana, dan kalau Anda ingin tahu bagaimana direktori ini bekerja."
      />

      <Container>
        <section>
          <SectionHeader
            title="Using MindCare"
            description="Lima tempat utama di direktori ini, dan apa yang bisa Anda lakukan di masing-masing."
            underline
          />
          <TopicGrid topics={directory} />
        </section>

        <section className="mt-16">
          <SectionHeader
            title="Legal & Safety"
            description="Dokumen yang mengatur pemakaian MindCare dan cara kami memeriksa isi direktori. Yang belum kami terbitkan tetap tercantum, tanpa tautan."
            underline
          />
          <TopicGrid topics={legal} />
        </section>
      </Container>
    </div>
  );
}

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

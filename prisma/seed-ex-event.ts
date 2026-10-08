import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MindCare demo data seed...");

  /*
   * ============================================================
   * EVENT CATEGORIES
   * ============================================================
   */

  const categories = [
    {
      name: "Webinar",
      slug: "webinar",
    },
    {
      name: "Workshop",
      slug: "workshop",
    },
    {
      name: "Support Group",
      slug: "support-group",
    },
    {
      name: "Training",
      slug: "training",
    },
    {
      name: "Seminar",
      slug: "seminar",
    },
  ];

  const categoryMap = new Map<string, number>();

  for (const category of categories) {
    const result = await prisma.eventCategory.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        isActive: true,
      },
    });

    categoryMap.set(category.slug, result.id);
  }

  /*
   * ============================================================
   * EVENT FOCUS AREAS
   * ============================================================
   */

  const focusAreas = [
    {
      name: "Kecemasan",
      slug: "kecemasan",
    },
    {
      name: "Stres",
      slug: "stres",
    },
    {
      name: "Burnout",
      slug: "burnout",
    },
    {
      name: "Trauma",
      slug: "trauma",
    },
    {
      name: "Hubungan",
      slug: "hubungan",
    },
    {
      name: "Pengembangan Diri",
      slug: "pengembangan-diri",
    },
    {
      name: "Pola Tidur",
      slug: "pola-tidur",
    },
    {
      name: "Pengasuhan",
      slug: "pengasuhan",
    },
    {
      name: "Duka Cita",
      slug: "duka-cita",
    },
  ];

  const focusAreaMap = new Map<string, number>();

  for (const focusArea of focusAreas) {
    const result = await prisma.eventFocusArea.upsert({
      where: {
        slug: focusArea.slug,
      },
      update: {
        name: focusArea.name,
        isActive: true,
      },
      create: {
        name: focusArea.name,
        slug: focusArea.slug,
        isActive: true,
      },
    });

    focusAreaMap.set(focusArea.slug, result.id);
  }

  /*
   * ============================================================
   * EVENTS
   * ============================================================
   */

  const events = [
    {
      title: "MindCare Connect: Mengelola Kecemasan di Dunia Kerja",
      slug: "mindcare-connect-mengelola-kecemasan-di-dunia-kerja",
      description: `Kecemasan dapat muncul ketika kita menghadapi presentasi, rapat penting, wawancara kerja, maupun situasi sosial di lingkungan profesional.

Dalam sesi ini, peserta akan memahami hubungan antara pikiran, emosi, dan respons tubuh serta mempelajari beberapa teknik sederhana untuk membantu menghadapi kecemasan dengan lebih tenang.`,

      location: null,
      format: "ONLINE" as const,

      startDate: "2026-10-03T19:00:00+07:00",
      endDate: "2026-10-03T20:30:00+07:00",

      price: 0,
      quota: 300,

      category: "webinar",

      focusAreas: [
        "kecemasan",
        "pengembangan-diri",
      ],

      agenda: [
        {
          title: "Pembukaan dan Pengenalan",
          description: "Pengenalan narasumber dan tujuan sesi.",
          startTime: "2026-10-03T19:00:00+07:00",
          endTime: "2026-10-03T19:15:00+07:00",
        },
        {
          title: "Memahami Kecemasan",
          description:
            "Memahami bagaimana kecemasan muncul dalam situasi profesional.",
          startTime: "2026-10-03T19:15:00+07:00",
          endTime: "2026-10-03T19:45:00+07:00",
        },
        {
          title: "Teknik Mengelola Kecemasan",
          description:
            "Latihan praktis untuk menghadapi situasi yang menegangkan.",
          startTime: "2026-10-03T19:45:00+07:00",
          endTime: "2026-10-03T20:15:00+07:00",
        },
        {
          title: "Tanya Jawab",
          description: "Diskusi bersama peserta.",
          startTime: "2026-10-03T20:15:00+07:00",
          endTime: "2026-10-03T20:30:00+07:00",
        },
      ],
    },

    {
      title: "MindCare Workshop: Psychological First Aid",
      slug: "mindcare-workshop-psychological-first-aid",
      description: `Workshop pengenalan Psychological First Aid untuk membantu peserta memahami prinsip dasar memberikan dukungan awal kepada seseorang yang sedang mengalami situasi sulit.

Peserta akan mempelajari pendekatan yang aman, batasan dalam memberikan bantuan, serta cara berkomunikasi secara suportif melalui latihan dan studi kasus.`,

      location: "Jakarta Selatan",
      format: "IN_PERSON" as const,

      startDate: "2026-10-10T09:00:00+07:00",
      endDate: "2026-10-10T15:00:00+07:00",

      price: 350000,
      quota: 40,

      category: "workshop",

      focusAreas: [
        "trauma",
        "stres",
      ],

      agenda: [
        {
          title: "Registrasi Peserta",
          description: "Registrasi dan persiapan workshop.",
          startTime: "2026-10-10T09:00:00+07:00",
          endTime: "2026-10-10T09:30:00+07:00",
        },
        {
          title: "Pengenalan Psychological First Aid",
          description:
            "Memahami prinsip dasar Psychological First Aid.",
          startTime: "2026-10-10T09:30:00+07:00",
          endTime: "2026-10-10T11:00:00+07:00",
        },
        {
          title: "Istirahat",
          description: null,
          startTime: "2026-10-10T11:00:00+07:00",
          endTime: "2026-10-10T11:30:00+07:00",
        },
        {
          title: "Simulasi dan Studi Kasus",
          description:
            "Latihan menggunakan beberapa skenario yang umum ditemui.",
          startTime: "2026-10-10T11:30:00+07:00",
          endTime: "2026-10-10T13:30:00+07:00",
        },
        {
          title: "Diskusi dan Penutup",
          description: "Diskusi akhir dan rangkuman materi.",
          startTime: "2026-10-10T13:30:00+07:00",
          endTime: "2026-10-10T15:00:00+07:00",
        },
      ],
    },

    {
      title: "Ruang Pulih: Berproses Setelah Kehilangan",
      slug: "ruang-pulih-berproses-setelah-kehilangan",
      description: `Kehilangan dapat membawa berbagai perubahan dalam kehidupan seseorang. Setiap orang memiliki proses berduka yang berbeda.

Sesi support group ini menyediakan ruang yang aman untuk berbagi pengalaman, mendengarkan satu sama lain, dan memahami bahwa proses berduka membutuhkan waktu.`,

      location: "Bandung",
      format: "IN_PERSON" as const,

      startDate: "2026-10-17T16:00:00+07:00",
      endDate: "2026-10-17T18:00:00+07:00",

      price: 0,
      quota: 20,

      category: "support-group",

      focusAreas: [
        "duka-cita",
      ],

      agenda: [
        {
          title: "Pembukaan",
          description: "Pengenalan aturan dan suasana kelompok.",
          startTime: "2026-10-17T16:00:00+07:00",
          endTime: "2026-10-17T16:20:00+07:00",
        },
        {
          title: "Berbagi Pengalaman",
          description: "Peserta mendapatkan kesempatan untuk berbagi.",
          startTime: "2026-10-17T16:20:00+07:00",
          endTime: "2026-10-17T17:20:00+07:00",
        },
        {
          title: "Refleksi Bersama",
          description: "Refleksi dan diskusi kelompok.",
          startTime: "2026-10-17T17:20:00+07:00",
          endTime: "2026-10-17T17:50:00+07:00",
        },
        {
          title: "Penutup",
          description: "Rangkuman dan penutup sesi.",
          startTime: "2026-10-17T17:50:00+07:00",
          endTime: "2026-10-17T18:00:00+07:00",
        },
      ],
    },

    {
      title: "MindCare Talk: Mengenali Burnout Sebelum Terlambat",
      slug: "mindcare-talk-mengenali-burnout-sebelum-terlambat",
      description: `Burnout dapat berkembang secara perlahan dan sering kali sulit dikenali pada tahap awal.

Sesi ini membahas tanda-tanda burnout, faktor yang dapat meningkatkan risikonya, serta bagaimana membangun batas yang lebih sehat antara pekerjaan, kehidupan pribadi, dan waktu pemulihan.`,

      location: null,
      format: "ONLINE" as const,

      startDate: "2026-10-24T19:30:00+07:00",
      endDate: "2026-10-24T21:00:00+07:00",

      price: 150000,
      quota: null,

      category: "webinar",

      focusAreas: [
        "burnout",
        "stres",
      ],

      agenda: [
        {
          title: "Opening",
          description: "Pembukaan dan pengantar sesi.",
          startTime: "2026-10-24T19:30:00+07:00",
          endTime: "2026-10-24T19:45:00+07:00",
        },
        {
          title: "Apa Itu Burnout?",
          description: "Mengenali burnout dan karakteristiknya.",
          startTime: "2026-10-24T19:45:00+07:00",
          endTime: "2026-10-24T20:15:00+07:00",
        },
        {
          title: "Mengenali Batas Diri",
          description:
            "Membahas batas sehat dalam pekerjaan dan kehidupan.",
          startTime: "2026-10-24T20:15:00+07:00",
          endTime: "2026-10-24T20:45:00+07:00",
        },
        {
          title: "Q&A",
          description: "Pertanyaan dan diskusi.",
          startTime: "2026-10-24T20:45:00+07:00",
          endTime: "2026-10-24T21:00:00+07:00",
        },
      ],
    },

    {
      title: "Parenting Lab: Mendampingi Anak Usia Sekolah",
      slug: "parenting-lab-mendampingi-anak-usia-sekolah",
      description: `Mendampingi anak usia sekolah membutuhkan komunikasi, batasan, dan pemahaman terhadap kebutuhan emosional anak.

Training ini membantu orang tua memahami cara berkomunikasi dengan anak, menghadapi emosi, serta membangun pola pengasuhan yang lebih suportif di rumah.`,

      location: "Yogyakarta",
      format: "IN_PERSON" as const,

      startDate: "2026-11-07T09:00:00+07:00",
      endDate: "2026-11-07T14:00:00+07:00",

      price: 250000,
      quota: 60,

      category: "training",

      focusAreas: [
        "pengasuhan",
        "hubungan",
      ],

      agenda: [
        {
          title: "Registrasi dan Pembukaan",
          description: null,
          startTime: "2026-11-07T09:00:00+07:00",
          endTime: "2026-11-07T09:30:00+07:00",
        },
        {
          title: "Memahami Anak Usia Sekolah",
          description:
            "Memahami kebutuhan perkembangan dan emosional anak.",
          startTime: "2026-11-07T09:30:00+07:00",
          endTime: "2026-11-07T10:30:00+07:00",
        },
        {
          title: "Komunikasi yang Lebih Efektif",
          description:
            "Latihan membangun komunikasi positif dengan anak.",
          startTime: "2026-11-07T10:30:00+07:00",
          endTime: "2026-11-07T11:30:00+07:00",
        },
        {
          title: "Istirahat",
          description: null,
          startTime: "2026-11-07T11:30:00+07:00",
          endTime: "2026-11-07T12:00:00+07:00",
        },
        {
          title: "Studi Kasus Pengasuhan",
          description:
            "Diskusi kasus dan latihan respons.",
          startTime: "2026-11-07T12:00:00+07:00",
          endTime: "2026-11-07T13:30:00+07:00",
        },
        {
          title: "Penutup",
          description: "Rangkuman materi.",
          startTime: "2026-11-07T13:30:00+07:00",
          endTime: "2026-11-07T14:00:00+07:00",
        },
      ],
    },

    {
      title: "Better Sleep: Tidur Cukup, Pikiran Lebih Jernih",
      slug: "better-sleep-tidur-cukup-pikiran-lebih-jernih",
      description: `Kualitas tidur memiliki hubungan erat dengan konsentrasi, suasana hati, dan kemampuan menjalani aktivitas sehari-hari.

Webinar ini membahas kebiasaan yang dapat mendukung tidur yang lebih baik serta bagaimana stres dan pola hidup dapat memengaruhi kualitas tidur.`,

      location: null,
      format: "ONLINE" as const,

      startDate: "2026-11-14T20:00:00+07:00",
      endDate: "2026-11-14T21:15:00+07:00",

      price: 0,
      quota: 500,

      category: "webinar",

      focusAreas: [
        "pola-tidur",
        "stres",
      ],

      agenda: [
        {
          title: "Pembukaan",
          description: null,
          startTime: "2026-11-14T20:00:00+07:00",
          endTime: "2026-11-14T20:10:00+07:00",
        },
        {
          title: "Mengapa Tidur Penting?",
          description:
            "Hubungan tidur dengan kondisi psikologis.",
          startTime: "2026-11-14T20:10:00+07:00",
          endTime: "2026-11-14T20:35:00+07:00",
        },
        {
          title: "Membangun Rutinitas Tidur",
          description:
            "Strategi membangun kebiasaan tidur yang lebih sehat.",
          startTime: "2026-11-14T20:35:00+07:00",
          endTime: "2026-11-14T21:00:00+07:00",
        },
        {
          title: "Tanya Jawab",
          description: null,
          startTime: "2026-11-14T21:00:00+07:00",
          endTime: "2026-11-14T21:15:00+07:00",
        },
      ],
    },

    {
      title: "Workplace Wellbeing Forum",
      slug: "workplace-wellbeing-forum",
      description: `Seminar yang membahas kesehatan psikologis di lingkungan kerja, termasuk stres kerja, burnout, komunikasi, dan pentingnya dukungan organisasi.

Sesi ini ditujukan bagi profesional, HR, team leader, dan organisasi yang ingin memahami pendekatan yang lebih baik dalam membangun lingkungan kerja yang suportif.`,

      location: "Surabaya",
      format: "HYBRID" as const,

      startDate: "2026-11-21T08:30:00+07:00",
      endDate: "2026-11-21T16:00:00+07:00",

      price: 500000,
      quota: 120,

      category: "seminar",

      focusAreas: [
        "burnout",
        "stres",
        "hubungan",
      ],

      agenda: [
        {
          title: "Registrasi",
          description: null,
          startTime: "2026-11-21T08:30:00+07:00",
          endTime: "2026-11-21T09:00:00+07:00",
        },
        {
          title: "Opening Session",
          description: "Pembukaan seminar.",
          startTime: "2026-11-21T09:00:00+07:00",
          endTime: "2026-11-21T09:30:00+07:00",
        },
        {
          title: "Stres dan Burnout di Tempat Kerja",
          description: null,
          startTime: "2026-11-21T09:30:00+07:00",
          endTime: "2026-11-21T11:00:00+07:00",
        },
        {
          title: "Istirahat",
          description: null,
          startTime: "2026-11-21T11:00:00+07:00",
          endTime: "2026-11-21T11:30:00+07:00",
        },
        {
          title: "Membangun Komunikasi yang Sehat",
          description: null,
          startTime: "2026-11-21T11:30:00+07:00",
          endTime: "2026-11-21T13:00:00+07:00",
        },
        {
          title: "Lunch Break",
          description: null,
          startTime: "2026-11-21T13:00:00+07:00",
          endTime: "2026-11-21T14:00:00+07:00",
        },
        {
          title: "Panel Discussion",
          description: "Diskusi panel bersama praktisi.",
          startTime: "2026-11-21T14:00:00+07:00",
          endTime: "2026-11-21T15:30:00+07:00",
        },
        {
          title: "Closing",
          description: null,
          startTime: "2026-11-21T15:30:00+07:00",
          endTime: "2026-11-21T16:00:00+07:00",
        },
      ],
    },

    {
      title: "Trauma-Informed Communication Workshop",
      slug: "trauma-informed-communication-workshop",
      description: `Workshop yang membahas bagaimana berbicara mengenai pengalaman sulit dan trauma dengan cara yang lebih aman dan suportif.

Peserta akan belajar mengenali batasan percakapan, menghindari respons yang tidak membantu, dan memahami prinsip dasar komunikasi yang trauma-informed.`,

      location: null,
      format: "ONLINE" as const,

      startDate: "2026-12-05T13:00:00+07:00",
      endDate: "2026-12-05T16:00:00+07:00",

      price: 200000,
      quota: 80,

      category: "workshop",

      focusAreas: [
        "trauma",
      ],

      agenda: [
        {
          title: "Introduction",
          description: "Pengenalan konsep trauma-informed communication.",
          startTime: "2026-12-05T13:00:00+07:00",
          endTime: "2026-12-05T13:30:00+07:00",
        },
        {
          title: "Memahami Respons Trauma",
          description: null,
          startTime: "2026-12-05T13:30:00+07:00",
          endTime: "2026-12-05T14:15:00+07:00",
        },
        {
          title: "Prinsip Komunikasi yang Aman",
          description: null,
          startTime: "2026-12-05T14:15:00+07:00",
          endTime: "2026-12-05T15:15:00+07:00",
        },
        {
          title: "Latihan dan Diskusi",
          description: null,
          startTime: "2026-12-05T15:15:00+07:00",
          endTime: "2026-12-05T16:00:00+07:00",
        },
      ],
    },

    {
      title: "Parenting Circle: Tumbuh Bersama sebagai Orang Tua",
      slug: "parenting-circle-tumbuh-bersama-sebagai-orang-tua",
      description: `Menjadi orang tua membawa berbagai tantangan dan perubahan dalam kehidupan sehari-hari.

Support group ini menyediakan ruang untuk berbagi pengalaman, memahami tantangan pengasuhan, dan membangun dukungan sosial bersama orang tua lainnya.`,

      location: "Denpasar",
      format: "IN_PERSON" as const,

      startDate: "2026-12-12T15:30:00+07:00",
      endDate: "2026-12-12T17:30:00+07:00",

      price: 0,
      quota: 25,

      category: "support-group",

      focusAreas: [
        "pengasuhan",
        "hubungan",
      ],

      agenda: [
        {
          title: "Welcome Circle",
          description: "Pembukaan dan perkenalan peserta.",
          startTime: "2026-12-12T15:30:00+07:00",
          endTime: "2026-12-12T15:50:00+07:00",
        },
        {
          title: "Parenting Stories",
          description: "Berbagi pengalaman pengasuhan.",
          startTime: "2026-12-12T15:50:00+07:00",
          endTime: "2026-12-12T16:40:00+07:00",
        },
        {
          title: "Membangun Support System",
          description: null,
          startTime: "2026-12-12T16:40:00+07:00",
          endTime: "2026-12-12T17:10:00+07:00",
        },
        {
          title: "Closing Reflection",
          description: "Refleksi dan penutup.",
          startTime: "2026-12-12T17:10:00+07:00",
          endTime: "2026-12-12T17:30:00+07:00",
        },
      ],
    },
  ];

  /*
   * ============================================================
   * CREATE / UPDATE EVENTS
   * ============================================================
   */

  for (const eventData of events) {
    const categoryId = categoryMap.get(eventData.category);

    if (!categoryId) {
      throw new Error(
        `Event category "${eventData.category}" was not found.`,
      );
    }

    const event = await prisma.event.upsert({
      where: {
        slug: eventData.slug,
      },

      update: {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        format: eventData.format,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        timeZone: "Asia/Jakarta",
        price: eventData.price,
        currency: "IDR",
        quota: eventData.quota,
        registrationType: "INTERNAL",
        publisherType: "PLATFORM",
        professionalId: null,
        careCentreId: null,
        // solutionId: null,
        categoryId,
        status: "PUBLISHED",
        deletedAt: null,
      },

      create: {
        title: eventData.title,
        slug: eventData.slug,
        description: eventData.description,
        location: eventData.location,
        format: eventData.format,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        timeZone: "Asia/Jakarta",
        price: eventData.price,
        currency: "IDR",
        quota: eventData.quota,
        registrationType: "INTERNAL",
        publisherType: "PLATFORM",
        categoryId,
        status: "PUBLISHED",
      },
    });

    /*
     * ==========================================================
     * FOCUS AREAS
     * ==========================================================
     */

    await prisma.eventFocusAreaMap.deleteMany({
      where: {
        eventId: event.id,
      },
    });

    for (const focusAreaSlug of eventData.focusAreas) {
      const focusAreaId = focusAreaMap.get(focusAreaSlug);

      if (!focusAreaId) {
        throw new Error(
          `Focus area "${focusAreaSlug}" was not found.`,
        );
      }

      await prisma.eventFocusAreaMap.create({
        data: {
          eventId: event.id,
          focusAreaId,
        },
      });
    }

    /*
     * ==========================================================
     * AGENDA
     * ==========================================================
     */

    await prisma.eventAgendaItem.deleteMany({
      where: {
        eventId: event.id,
      },
    });

    await prisma.eventAgendaItem.createMany({
      data: eventData.agenda.map((item, index) => ({
        eventId: event.id,
        title: item.title,
        description: item.description,
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
        sortOrder: index + 1,
      })),
    });

    console.log(`✓ ${event.title}`);
  }

  console.log("");
  console.log("✅ MindCare demo event data seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import type {
  CareCentre,
  CareCentreFacets,
  CentreKind,
  CentreService,
} from "../type/careCentre";

const services = {
  konsultasiPsikiatri: {
    id: "svc-1",
    slug: "konsultasi-psikiatri",
    name: "Konsultasi Psikiatri",
  },
  psikoterapi: { id: "svc-2", slug: "psikoterapi", name: "Psikoterapi" },
  tesPsikologi: {
    id: "svc-3",
    slug: "tes-psikologi",
    name: "Tes Psikologi",
  },
  konselingKeluarga: {
    id: "svc-4",
    slug: "konseling-keluarga",
    name: "Konseling Keluarga",
  },
  konselingAnakRemaja: {
    id: "svc-5",
    slug: "konseling-anak-remaja",
    name: "Konseling Anak & Remaja",
  },
  terapiKelompok: {
    id: "svc-6",
    slug: "terapi-kelompok",
    name: "Terapi Kelompok",
  },
  rehabilitasi: { id: "svc-7", slug: "rehabilitasi", name: "Rehabilitasi" },
  gawatDarurat: {
    id: "svc-8",
    slug: "gawat-darurat",
    name: "Layanan Gawat Darurat",
  },
} satisfies Record<string, CentreService>;

const careCentres: CareCentre[] = [
  {
    id: "centre-1",
    slug: "klinik-jiwa-sehat-kemang",
    name: "Klinik Jiwa Sehat Kemang",
    kind: "Klinik",
    photoUrl: null,
    isVerified: true,
    isOpenNow: true,
    openingHours: "Sen–Sab, 08.00–20.00",
    services: [
      services.konsultasiPsikiatri,
      services.psikoterapi,
      services.tesPsikologi,
    ],
    address: {
      street: "Jl. Kemang Raya No. 12",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12730",
    },
    coordinates: { latitude: -6.2615, longitude: 106.8106 },
    phone: "(021) 5550 1180",
    acceptsBpjs: false,
    professionalCount: 7,
    createdAt: "2026-04-02T02:00:00.000Z",
  },
  {
    id: "centre-2",
    slug: "pusat-konseling-cakrawala",
    name: "Pusat Konseling Cakrawala",
    kind: "Pusat Konseling",
    photoUrl: null,
    isVerified: true,
    isOpenNow: true,
    openingHours: "Sen–Jum, 09.00–18.00",
    services: [
      services.psikoterapi,
      services.konselingKeluarga,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. Cihampelas No. 88",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40131",
    },
    coordinates: { latitude: -6.9147, longitude: 107.6098 },
    phone: "(022) 5550 2214",
    acceptsBpjs: false,
    professionalCount: 5,
    createdAt: "2026-04-05T02:00:00.000Z",
  },
  {
    id: "centre-3",
    slug: "klinik-psikologi-adyatma",
    name: "Klinik Psikologi Adyatma",
    kind: "Klinik",
    photoUrl: null,
    isVerified: false,
    isOpenNow: false,
    openingHours: "Sen–Jum, 10.00–17.00",
    services: [
      services.tesPsikologi,
      services.konselingAnakRemaja,
      services.psikoterapi,
    ],
    address: {
      street: "Jl. Kaliurang KM 5 No. 21",
      city: "Yogyakarta",
      province: "DI Yogyakarta",
      postalCode: "55281",
    },
    coordinates: { latitude: -7.7956, longitude: 110.3695 },
    phone: "(0274) 5550 337",
    acceptsBpjs: false,
    professionalCount: 4,
    createdAt: "2026-04-09T02:00:00.000Z",
  },
  {
    id: "centre-4",
    slug: "rsu-bina-nurani",
    name: "RSU Bina Nurani",
    kind: "Rumah Sakit",
    photoUrl: null,
    isVerified: true,
    isOpenNow: true,
    openingHours: "Setiap hari, 24 jam",
    services: [
      services.konsultasiPsikiatri,
      services.gawatDarurat,
      services.rehabilitasi,
      services.psikoterapi,
    ],
    address: {
      street: "Jl. Raya Darmo No. 145",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60241",
    },
    coordinates: { latitude: -7.2575, longitude: 112.7521 },
    phone: "(031) 5550 4460",
    acceptsBpjs: true,
    professionalCount: 12,
    createdAt: "2026-04-12T02:00:00.000Z",
  },
  {
    id: "centre-5",
    slug: "puskesmas-cempaka-wangi",
    name: "Puskesmas Cempaka Wangi",
    kind: "Puskesmas",
    photoUrl: null,
    isVerified: true,
    isOpenNow: true,
    openingHours: "Sen–Sab, 07.30–15.00",
    services: [services.konsultasiPsikiatri, services.konselingKeluarga],
    address: {
      street: "Jl. Cempaka Wangi No. 4",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10510",
    },
    coordinates: { latitude: -6.1862, longitude: 106.834 },
    phone: "(021) 5550 5502",
    acceptsBpjs: true,
    professionalCount: 3,
    createdAt: "2026-04-16T02:00:00.000Z",
  },
  {
    id: "centre-6",
    slug: "klinik-sahabat-pikiran",
    name: "Klinik Sahabat Pikiran",
    kind: "Klinik",
    photoUrl: null,
    isVerified: false,
    isOpenNow: true,
    openingHours: "Sen–Sab, 09.00–19.00",
    services: [
      services.psikoterapi,
      services.konselingAnakRemaja,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. Setia Budi No. 67",
      city: "Medan",
      province: "Sumatera Utara",
      postalCode: "20122",
    },
    coordinates: { latitude: 3.5952, longitude: 98.6722 },
    phone: "(061) 5550 6318",
    acceptsBpjs: false,
    professionalCount: 6,
    createdAt: "2026-04-20T02:00:00.000Z",
  },
  {
    id: "centre-7",
    slug: "pusat-konseling-bali-tenang",
    name: "Pusat Konseling Bali Tenang",
    kind: "Pusat Konseling",
    photoUrl: null,
    isVerified: true,
    isOpenNow: false,
    openingHours: "Sen–Jum, 09.00–17.00",
    services: [
      services.konselingKeluarga,
      services.psikoterapi,
      services.tesPsikologi,
    ],
    address: {
      street: "Jl. Sudirman No. 30",
      city: "Denpasar",
      province: "Bali",
      postalCode: "80114",
    },
    coordinates: { latitude: -8.6705, longitude: 115.2126 },
    phone: "(0361) 5550 771",
    acceptsBpjs: false,
    professionalCount: 4,
    createdAt: "2026-04-24T02:00:00.000Z",
  },
  {
    id: "centre-8",
    slug: "rsu-sekar-arum",
    name: "RSU Sekar Arum",
    kind: "Rumah Sakit",
    photoUrl: null,
    isVerified: true,
    isOpenNow: true,
    openingHours: "Setiap hari, 24 jam",
    services: [
      services.konsultasiPsikiatri,
      services.gawatDarurat,
      services.rehabilitasi,
      services.konselingKeluarga,
    ],
    address: {
      street: "Jl. Pandanaran No. 98",
      city: "Semarang",
      province: "Jawa Tengah",
      postalCode: "50241",
    },
    coordinates: { latitude: -6.9932, longitude: 110.4203 },
    phone: "(024) 5550 8890",
    acceptsBpjs: true,
    professionalCount: 10,
    createdAt: "2026-04-28T02:00:00.000Z",
  },
  {
    id: "centre-9",
    slug: "klinik-anindya-mandiri",
    name: "Klinik Anindya Mandiri",
    kind: "Klinik",
    photoUrl: null,
    isVerified: false,
    isOpenNow: true,
    openingHours: "Sen–Sab, 08.00–18.00",
    services: [
      services.tesPsikologi,
      services.psikoterapi,
      services.konselingAnakRemaja,
      services.terapiKelompok,
    ],
    address: {
      street: "Jl. A. P. Pettarani No. 55",
      city: "Makassar",
      province: "Sulawesi Selatan",
      postalCode: "90222",
    },
    coordinates: { latitude: -5.1477, longitude: 119.4327 },
    phone: "(0411) 5550 913",
    acceptsBpjs: true,
    professionalCount: 5,
    createdAt: "2026-05-02T02:00:00.000Z",
  },
];

export async function getCareCentres(): Promise<CareCentre[]> {
  return [...careCentres].sort((a, b) => a.name.localeCompare(b.name, "id-ID"));
}

export async function getCareCentreBySlug(
  slug: string,
): Promise<CareCentre | null> {
  return careCentres.find((item) => item.slug === slug) ?? null;
}

export async function getCareCentreFacets(): Promise<CareCentreFacets> {
  const kinds = new Set<CentreKind>();
  const servicesBySlug = new Map<string, CentreService>();
  const cities = new Set<string>();

  for (const centre of careCentres) {
    kinds.add(centre.kind);
    cities.add(centre.address.city);
    for (const service of centre.services) {
      servicesBySlug.set(service.slug, service);
    }
  }

  return {
    kinds: [...kinds].sort((a, b) => a.localeCompare(b, "id-ID")),
    services: [...servicesBySlug.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "id-ID"),
    ),
    cities: [...cities].sort((a, b) => a.localeCompare(b, "id-ID")),
  };
}

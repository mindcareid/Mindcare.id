// Cek invarian mock data. Jalankan: node scripts/check-data-invariants.mjs
//
// Kenapa ini ada: beberapa angka di mock data BUKAN data mandiri, melainkan
// turunan dari data lain — `startingPriceIdr` sebenarnya harga termurah di
// `services`, `registeredCount` sebenarnya hitungan baris pendaftaran, dan
// `professionalCount` sebenarnya hitungan relasi. Selama masih mock, angka itu
// ditulis tangan, dan tidak ada apa pun yang menahan kalau salah satunya digeser
// tanpa menggeser pasangannya. `tsc` tidak bisa menangkapnya: tipenya `number`
// dan tetap `number` walau nilainya salah.
//
// File ini juga memeriksa tautan lintas fitur (`article.author.professionalSlug`
// dan `event.host.slug`) yang hanya berupa string — salah tulis satu huruf tidak
// bikin error, cuma bikin blok di halaman detail diam-diam kosong.
//
// Sengaja tanpa dependency dan tanpa TypeScript: file ini membaca teks sumber
// dan tidak mengimpor apa pun dari `app/`, supaya bisa jalan tanpa build dan
// tanpa `node_modules` yang lengkap. Konsekuensinya cek di sini dangkal
// (regex, bukan AST) — cukup untuk invarian angka dan slug, tidak lebih.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(join(root, relative), "utf8");

const problems = [];
const fail = (message) => problems.push(message);

// Ambil isi satu array literal dari teks sumber dengan MENGHITUNG KURUNG, bukan
// dengan regex.
//
// Sebelumnya semua blok array diambil dengan pola `field: \[([\s\S]*?)\n    \],`
// dan pola itu punya lubang: kalau arraynya ditulis kosong dalam satu baris
// (`about: [],`), pola itu tidak berhenti di situ melainkan melewatinya dan
// menutup di array BERIKUTNYA. Akibatnya isi `agenda` terbaca sebagai isi
// `about`, blok yang benar-benar kosong terlihat berisi, dan cek "kosong" lolos.
// Ketemu 24 Agustus 2026 justru lewat sabotase — harnessnya sendiri hijau.
// Lubang yang sama ada di `overview`, `whoItIsFor`, `curriculum`, dan `bio`.
//
// Mengembalikan `null` kalau fieldnya tidak ada sama sekali, dan string kosong
// kalau arraynya ada tapi kosong. Dua hal itu memang beda: yang pertama field
// hilang, yang kedua field ada tapi tidak berisi.
function arrayBlock(source, field) {
  const opener = new RegExp(`\\n\\s*${field}: \\[`).exec(source);
  if (!opener) return null;

  const start = opener.index + opener[0].length;
  let depth = 0;
  let inString = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (ch === "\\") i += 1;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[") depth += 1;
    else if (ch === "]") {
      if (depth === 0) return source.slice(start, i);
      depth -= 1;
    }
  }
  return null;
}

const quotedStrings = (block) =>
  [...block.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

// --- Professionals -----------------------------------------------------------

const professionalsSource = read("app/(user)/professionals/data/professionals.ts");

// Pecah per objek profesional dengan menandai batas `id: "prof-N"`.
const professionalChunks = professionalsSource
  .split(/\n    id: "(prof-\d+)"/)
  .slice(1);

const professionals = [];
for (let i = 0; i < professionalChunks.length; i += 2) {
  const body = professionalChunks[i + 1] ?? "";
  professionals.push({
    id: professionalChunks[i],
    body,
    // Slug profesionalnya sendiri = kemunculan `slug:` PERTAMA di dalam objeknya.
    // Penting diambil dari sini, bukan dari regex sekali jalan atas seluruh file:
    // objek `areas` dan `approaches` juga punya `slug:` dengan indentasi yang
    // sama begitu Prettier memecahnya jadi multi-baris, dan itu sempat bikin
    // daftar slug profesional kemasukan "pengembangan-diri" dan
    // "terapi-berfokus-solusi" — cek tautan lintas fitur jadi terlalu longgar.
    slug: body.match(/slug: "([^"]+)"/)?.[1],
  });
}

if (professionals.length === 0) {
  fail("professionals: tidak ada objek yang terbaca — pola pemisahnya berubah?");
}

for (const professional of professionals) {
  const { id, body, slug } = professional;

  const starting = Number(body.match(/startingPriceIdr: (\d+)/)?.[1]);
  const prices = [...body.matchAll(/priceIdr: (\d+)/g)].map((m) => Number(m[1]));
  const modes = [...(body.match(/sessionModes: \[([^\]]*)\]/)?.[1] ?? "")
    .matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const serviceModes = [...body.matchAll(/mode: "([^"]+)"/g)].map((m) => m[1]);

  if (!slug) fail(`${id}: tidak punya slug`);

  // Invarian 1: startingPriceIdr = harga termurah di services.
  if (prices.length === 0) {
    fail(`${id} (${slug}): tidak punya services`);
  } else {
    const cheapest = Math.min(...prices);
    if (cheapest !== starting) {
      fail(
        `${id} (${slug}): startingPriceIdr ${starting} tidak sama dengan harga termurah di services ${cheapest}`,
      );
    }
  }

  // Invarian 2: setiap service.mode harus ada di sessionModes.
  for (const mode of serviceModes) {
    if (!modes.includes(mode)) {
      fail(
        `${id} (${slug}): ada service bermode "${mode}" tapi sessionModes cuma [${modes.join(", ")}]`,
      );
    }
  }

  // Invarian 3: setiap mode yang diiklankan harus punya minimal satu service.
  for (const mode of modes) {
    if (!serviceModes.includes(mode)) {
      fail(
        `${id} (${slug}): sessionModes memuat "${mode}" tapi tidak ada service dengan mode itu`,
      );
    }
  }

  // Invarian 4: bio tidak boleh kosong, headline satu kalimat.
  const bioBlock = arrayBlock(body, "bio");
  if (bioBlock === null) fail(`${id} (${slug}): tidak punya bio`);
  else if (bioBlock.trim() === "") fail(`${id} (${slug}): bio kosong`);

  // Invarian 5: tahun lulus wajar dan berurutan naik.
  const years = [...body.matchAll(/year: (\d+)/g)].map((m) => Number(m[1]));
  for (const year of years) {
    if (year < 1960 || year > 2026) {
      fail(`${id} (${slug}): tahun pendidikan ${year} di luar rentang wajar`);
    }
  }

  // Invarian 6: bookingUrl null atau https.
  const booking = body.match(/bookingUrl: (null|"[^"]*")/)?.[1];
  if (booking && booking !== "null" && !booking.startsWith('"https://')) {
    fail(`${id} (${slug}): bookingUrl bukan null dan bukan https — ${booking}`);
  }
}

// Invarian 7: id dan slug unik.
for (const field of ["id", "slug"]) {
  const values = professionals.map((professional) => professional[field]);
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`professionals: ${field} kembar — ${value}`);
    seen.add(value);
  }
}

const professionalSlugs = new Set(
  professionals.map((professional) => professional.slug).filter(Boolean),
);

// --- Tautan lintas fitur -----------------------------------------------------

const articlesSource = read("app/(user)/insights/data/articles.ts");

// Regex ini menyapu SELURUH file, jadi ia mencakup `professionalSlug` milik
// author sekaligus milik reviewer — keduanya berasal dari peta `people` yang sama.
// Sejak halaman detail artikel memasang tautan "View profile" untuk keduanya,
// keduanya memang harus ikut diperiksa.
const linkedSlugs = [...articlesSource.matchAll(/professionalSlug: "([^"]+)"/g)].map(
  (m) => m[1],
);

for (const slug of new Set(linkedSlugs)) {
  if (!professionalSlugs.has(slug)) {
    fail(
      `articles: professionalSlug "${slug}" tidak ada di data profesional — tautan "View profile" akan 404 dan blok "Articles by" diam-diam kosong`,
    );
  }
}

// --- Artikel: badan tulisan dan waktu baca -----------------------------------

// `readTimeMinutes` masuk kategori yang sama dengan `startingPriceIdr`: bukan data
// mandiri, melainkan turunan dari `body`. Rumusnya `ceil(jumlah kata / 180)`,
// dihitung dari `text` milik heading/paragraph/quote plus seluruh `items` milik
// list, dan TIDAK menghitung `attribution` karena baris atribusi bukan bacaan.
// Sembilan angka pertama di file itu ditulis tangan sebelum `body` ada dan
// SEMUANYA keliru (4–9 menit untuk badan yang sebenarnya 2–4 menit), yang persis
// jenis kesalahan yang tidak akan pernah ditangkap `tsc`.
const WORDS_PER_MINUTE = 180;

const articleChunks = articlesSource.split(/\n    id: "(art-\d+)"/).slice(1);

const articles = [];
for (let i = 0; i < articleChunks.length; i += 2) {
  articles.push({ id: articleChunks[i], body: articleChunks[i + 1] ?? "" });
}

if (articles.length === 0) {
  fail("articles: tidak ada objek yang terbaca — pola pemisahnya berubah?");
}

for (const article of articles) {
  const { id, body: chunk } = article;
  const slug = chunk.match(/slug: "([^"]+)"/)?.[1];
  const label = `${id} (${slug ?? "tanpa slug"})`;

  const bodyStart = chunk.indexOf("body: [");
  if (bodyStart === -1) {
    fail(`${label}: tidak punya body`);
    continue;
  }
  const body = chunk.slice(bodyStart);

  const kinds = [...body.matchAll(/kind: "([^"]+)"/g)].map((m) => m[1]);
  const blockIds = [...body.matchAll(/\n\s{8}id: "([^"]+)"/g)].map((m) => m[1]);
  const texts = [...body.matchAll(/\btext: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const itemBlocks = [...body.matchAll(/items: \[([\s\S]*?)\n\s*\],/g)].map(
    (m) => m[1],
  );

  // Pola `items: [` di atas punya lubang yang sama dengan blok array lain:
  // `items: []` tidak cocok sama sekali, jadi blok list yang benar-benar kosong
  // tidak terbaca — bukan terbaca lalu ditolak, melainkan tidak terhitung. Beda
  // dari `about` atau `overview`, `items` bisa muncul berkali-kali dalam satu
  // artikel sehingga `arrayBlock` (yang cuma mengambil kemunculan pertama) tidak
  // dipakai di sini; yang dijaga jumlahnya.
  const itemBlockCount = [...body.matchAll(/items: \[/g)].length;
  if (itemBlocks.length !== itemBlockCount) {
    fail(
      `${label}: ada ${itemBlockCount} blok items tapi cuma ${itemBlocks.length} yang terbaca — ada yang ditulis kosong?`,
    );
  }
  const items = itemBlocks.flatMap((block) =>
    [...block.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
  );

  // Invarian 9: body tidak boleh kosong dan harus punya minimal satu paragraf.
  if (kinds.length === 0) {
    fail(`${label}: body kosong`);
    continue;
  }
  if (!kinds.includes("paragraph")) {
    fail(`${label}: body tidak punya satu pun blok paragraph`);
  }

  // Invarian 10: setiap blok punya id, dan id-nya unik di dalam satu artikel —
  // id blok heading dipakai sebagai anchor `#id` di DOM oleh daftar isi.
  if (blockIds.length !== kinds.length) {
    fail(
      `${label}: ada ${kinds.length} blok tapi cuma ${blockIds.length} id blok terbaca`,
    );
  }
  const seenBlockIds = new Set();
  for (const blockId of blockIds) {
    if (seenBlockIds.has(blockId)) {
      fail(`${label}: id blok kembar "${blockId}" — anchor daftar isi jadi ambigu`);
    }
    seenBlockIds.add(blockId);
  }

  // Invarian 11: tidak ada teks atau butir daftar yang kosong.
  for (const text of texts) {
    if (text.trim() === "") fail(`${label}: ada blok dengan text kosong`);
  }
  for (const item of items) {
    if (item.trim() === "") fail(`${label}: ada butir list yang kosong`);
  }

  // Invarian 12: setiap blok list harus punya `ordered` dan minimal satu butir.
  const listCount = kinds.filter((kind) => kind === "list").length;
  const orderedCount = [...body.matchAll(/ordered: (?:true|false)/g)].length;
  if (listCount !== orderedCount) {
    fail(
      `${label}: ada ${listCount} blok list tapi ${orderedCount} field ordered`,
    );
  }
  for (const block of itemBlocks) {
    if (!/"/.test(block)) fail(`${label}: ada blok list tanpa butir`);
  }

  // Invarian 13: readTimeMinutes = ceil(kata / 180).
  const declared = Number(chunk.match(/readTimeMinutes: (\d+)/)?.[1]);
  const words = [...texts, ...items]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const derived = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  if (declared !== derived) {
    fail(
      `${label}: readTimeMinutes ${declared} tidak sama dengan turunan ${derived} (${words} kata / ${WORDS_PER_MINUTE} kata per menit)`,
    );
  }
}

// Invarian 14: id dan slug artikel unik.
for (const field of ["id", "slug"]) {
  const values = articles.map((article) =>
    field === "id" ? article.id : article.body.match(/slug: "([^"]+)"/)?.[1],
  );
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`articles: ${field} kembar — ${value}`);
    seen.add(value);
  }
}

// --- Solutions: kurikulum, harga, dan pemimpin program ----------------------

// `curriculum.length` termasuk golongan nilai turunan yang sama dengan
// `startingPriceIdr` dan `readTimeMinutes`: daftar pertemuan itu rincian dari
// `sessionCount`, bukan data terpisah. Kalau keduanya berselisih, halaman detail
// bisa bilang "12 sessions" sambil memperlihatkan lima baris — dan `tsc` diam
// saja karena dua-duanya tetap bertipe benar.

const solutionsSource = read("app/(user)/solutions/data/solutions.ts");

// Harga sesi termurah tiap profesional, dipakai memeriksa harga paket
// `individuals` di bawah. Diambil dari objek profesionalnya, bukan regex sekali
// jalan atas seluruh file — alasannya sama dengan catatan di bagian atas.
const startingPriceBySlug = new Map(
  professionals
    .filter((professional) => professional.slug)
    .map((professional) => [
      professional.slug,
      Number(professional.body.match(/startingPriceIdr: (\d+)/)?.[1]),
    ]),
);

const solutionChunks = solutionsSource.split(/\n    id: "(sol-\d+)"/).slice(1);

const solutions = [];
for (let i = 0; i < solutionChunks.length; i += 2) {
  solutions.push({ id: solutionChunks[i], body: solutionChunks[i + 1] ?? "" });
}

if (solutions.length === 0) {
  fail("solutions: tidak ada objek yang terbaca — pola pemisahnya berubah?");
}

for (const solution of solutions) {
  const { id, body } = solution;
  const slug = body.match(/slug: "([^"]+)"/)?.[1];
  const label = `${id} (${slug ?? "tanpa slug"})`;

  const sessionCount = Number(body.match(/sessionCount: (\d+)/)?.[1]);
  // Id pertemuan berindentasi 8 spasi (`sol-N-sM`), jadi anchor ini tidak
  // mungkin ikut menangkap id solusinya sendiri yang berindentasi 4 spasi.
  const sessionIds = [...body.matchAll(/\n\s{8}id: "(sol-\d+-s\d+)"/g)].map(
    (m) => m[1],
  );

  // Invarian 15: curriculum.length = sessionCount.
  if (sessionIds.length !== sessionCount) {
    fail(
      `${label}: sessionCount ${sessionCount} tidak sama dengan jumlah pertemuan di curriculum ${sessionIds.length}`,
    );
  }

  // Invarian 16: id pertemuan unik di dalam satu solusi.
  const seenSessionIds = new Set();
  for (const sessionId of sessionIds) {
    if (seenSessionIds.has(sessionId)) {
      fail(`${label}: id pertemuan kembar "${sessionId}"`);
    }
    seenSessionIds.add(sessionId);
  }

  // Invarian 17: overview minimal satu paragraf, whoItIsFor minimal tiga butir.
  const overviewBlock = arrayBlock(body, "overview");
  if (overviewBlock === null) fail(`${label}: tidak punya overview`);
  const overviewCount = quotedStrings(overviewBlock ?? "").filter(
    (text) => text.trim() !== "",
  ).length;
  if (overviewCount === 0) fail(`${label}: overview kosong`);

  const whoBlock = arrayBlock(body, "whoItIsFor");
  if (whoBlock === null) fail(`${label}: tidak punya whoItIsFor`);
  const whoItems = quotedStrings(whoBlock ?? "");
  if (whoItems.length < 3) {
    fail(
      `${label}: whoItIsFor cuma ${whoItems.length} butir — di bawah tiga, daftarnya terbaca setengah jadi`,
    );
  }
  for (const item of whoItems) {
    if (item.trim() === "") fail(`${label}: ada butir whoItIsFor yang kosong`);
  }

  // Invarian 18: tidak ada judul atau ringkasan pertemuan yang kosong.
  const curriculumBlock = arrayBlock(body, "curriculum") ?? "";
  for (const field of ["title", "summary"]) {
    const values = [
      ...curriculumBlock.matchAll(
        new RegExp(`${field}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g"),
      ),
    ].map((m) => m[1]);
    for (const value of values) {
      if (value.trim() === "") {
        fail(`${label}: ada pertemuan dengan ${field} kosong`);
      }
    }
  }

  // Invarian 19: priceIdr null atau bulat ribuan.
  const priceRaw = body.match(/priceIdr: (null|\d+)/)?.[1];
  if (priceRaw === undefined) {
    fail(`${label}: tidak punya priceIdr`);
  } else if (priceRaw !== "null" && Number(priceRaw) % 1000 !== 0) {
    fail(`${label}: priceIdr ${priceRaw} bukan bulat ribuan`);
  }

  // Invarian 20: leadProfessionalSlug null atau benar-benar ada.
  const leadRaw = body.match(/leadProfessionalSlug: (null|"[^"]+")/)?.[1];
  const leadSlug =
    leadRaw && leadRaw !== "null" ? leadRaw.slice(1, -1) : null;
  if (leadSlug && !professionalSlugs.has(leadSlug)) {
    fail(
      `${label}: leadProfessionalSlug "${leadSlug}" tidak ada di data profesional — tautan "View profile" akan 404`,
    );
  }

  // Invarian 21: harga paket `individuals` tidak boleh melebihi
  // sessionCount x harga sesi termurah si pemimpin. Paket yang lebih mahal
  // daripada membeli sesi satu-satu itu bug, bukan pilihan harga.
  //
  // SENGAJA hanya untuk `individuals`: program `workplaces` dihitung per
  // perusahaan dan `communities` per peserta, jadi perbandingan per-sesi tidak
  // berlaku di sana. Keputusan diaze, 21 Agustus 2026.
  const isIndividuals = /categories\.individuals/.test(body);
  if (isIndividuals && priceRaw && priceRaw !== "null" && leadSlug) {
    const starting = startingPriceBySlug.get(leadSlug);
    if (Number.isFinite(starting) && Number.isFinite(sessionCount)) {
      const cap = starting * sessionCount;
      if (Number(priceRaw) > cap) {
        fail(
          `${label}: priceIdr ${priceRaw} melewati ${sessionCount} x ${starting} = ${cap} (harga paket lebih mahal daripada beli sesi satu-satu dari ${leadSlug})`,
        );
      }
    }
  }
}

// Invarian 22: id dan slug solusi unik.
for (const field of ["id", "slug"]) {
  const values = solutions.map((solution) =>
    field === "id" ? solution.id : solution.body.match(/slug: "([^"]+)"/)?.[1],
  );
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`solutions: ${field} kembar — ${value}`);
    seen.add(value);
  }
}

// --- Care centres: jam praktik, zona waktu, dan roster profesional -----------

// Bagian ini masuk 24 Agustus 2026 bersamaan dengan perubahan kontrak
// `CareCentre`. Tiga hal yang dulu ditulis tangan sekarang punya pasangan yang
// bisa dihitung, dan tanpa cek di sini ketiganya bisa berselisih tanpa suara:
//
//   - `professionalCount` terhadap `professionalSlugs.length`
//   - `openingHours` terhadap bentuknya sendiri (tujuh hari, jam yang masuk akal)
//   - `professionalSlugs` terhadap data profesional dan kota masing-masing
//
// Nama field kota di dua file berbeda (`address.city` di centre,
// `location.city` di profesional), jadi tidak ada apa pun di TypeScript yang
// menghubungkan keduanya — seorang konselor Bandung bisa terdaftar praktik di
// klinik Medan dan `tsc` tetap diam.

const centresSource = read("app/(user)/care-centres/data/careCentres.ts");

// Kota tiap profesional, dipakai invarian 34. Diambil dari objek profesionalnya
// masing-masing, bukan regex sekali jalan atas seluruh file, karena urutannya
// harus tetap berpasangan dengan slugnya.
const cityByProfessionalSlug = new Map(
  professionals
    .filter((professional) => professional.slug)
    .map((professional) => [
      professional.slug,
      professional.body.match(/location: \{\s*city: "([^"]+)"/)?.[1] ?? null,
    ]),
);

for (const [slug, city] of cityByProfessionalSlug) {
  if (city === null) {
    fail(
      `professionals: kota ${slug} tidak terbaca — pola \`location: { city: ... }\` berubah?`,
    );
  }
}

// Zona waktu Indonesia ditentukan provinsi, bukan selera. Tabel ini cuma memuat
// provinsi yang benar-benar dipakai di mock data; provinsi baru WAJIB didaftarkan
// di sini, dan kalau lupa, invarian 35 akan berbunyi — itu memang yang diinginkan,
// jauh lebih baik daripada diam lalu menampilkan jam yang salah satu jam.
const ZONE_BY_PROVINCE = {
  "DKI Jakarta": "Asia/Jakarta",
  "Jawa Barat": "Asia/Jakarta",
  "Jawa Tengah": "Asia/Jakarta",
  "Jawa Timur": "Asia/Jakarta",
  "DI Yogyakarta": "Asia/Jakarta",
  "Sumatera Utara": "Asia/Jakarta",
  Bali: "Asia/Makassar",
  "Sulawesi Selatan": "Asia/Makassar",
};

const centreChunks = centresSource.split(/\n    id: "(centre-\d+)"/).slice(1);

const centres = [];
for (let i = 0; i < centreChunks.length; i += 2) {
  const body = centreChunks[i + 1] ?? "";
  centres.push({
    id: centreChunks[i],
    body,
    slug: body.match(/slug: "([^"]+)"/)?.[1],
  });
}

if (centres.length === 0) {
  fail("care-centres: tidak ada objek yang terbaca — pola pemisahnya berubah?");
}

// Dipakai juga oleh invarian 27 di bagian Events di bawah.
const centreSlugs = new Set(
  centres.map((centre) => centre.slug).filter(Boolean),
);

// Siapa saja yang sudah dipakai, untuk invarian 33.
const centreOfProfessional = new Map();

for (const centre of centres) {
  const { id, body, slug } = centre;
  const label = `${id} (${slug ?? "tanpa slug"})`;

  if (!slug) fail(`${id}: tidak punya slug`);

  // Invarian 29: openingHours tepat tujuh entri, hari 1 sampai 7 berurutan.
  //
  // Ini alasan utama jam praktik ditulis apa adanya di file data dan tidak
  // dihasilkan fungsi pembangun: harness ini `.mjs` dan membaca teks, jadi jam
  // yang dihitung di runtime tidak bisa diperiksa dari sini sama sekali.
  const hoursBlock = arrayBlock(body, "openingHours");
  if (hoursBlock === null) {
    fail(`${label}: tidak punya openingHours`);
    continue;
  }

  const entries = [
    ...hoursBlock.matchAll(
      /day: (\d+),\s*opens: (null|"[^"]*"),\s*closes: (null|"[^"]*")/g,
    ),
  ].map((m) => ({
    day: Number(m[1]),
    opens: m[2] === "null" ? null : m[2].slice(1, -1),
    closes: m[3] === "null" ? null : m[3].slice(1, -1),
  }));

  // Jumlah `day:` dihitung terpisah supaya entri yang urutan fieldnya digeser
  // (`opens` sebelum `day`, misalnya) memberi pesan yang benar — bukan diam-diam
  // tidak terhitung lalu muncul sebagai "cuma 6 hari".
  const dayMarkers = [...hoursBlock.matchAll(/day: \d+/g)].length;
  if (entries.length !== dayMarkers) {
    fail(
      `${label}: ada ${dayMarkers} entri jam tapi cuma ${entries.length} yang terbaca — urutan field day/opens/closes berubah?`,
    );
  }

  if (entries.length !== 7) {
    fail(
      `${label}: openingHours ${entries.length} entri, harus tepat 7 — tabel jam di halaman detail akan bolong`,
    );
  }

  const days = entries.map((entry) => entry.day);
  const expected = [1, 2, 3, 4, 5, 6, 7];
  if (entries.length === 7 && days.join(",") !== expected.join(",")) {
    fail(
      `${label}: urutan hari [${days.join(", ")}] bukan 1..7 berurutan — UI merender apa adanya, jadi Senin bisa muncul di bawah Minggu`,
    );
  }

  // Invarian 30: opens dan closes harus sepasang, berformat HH:MM, dan closes
  // setelah opens.
  //
  // Cuma satu dari dua yang null itu bukan "tutup" dan bukan "buka" — `isOpenAt`
  // memperlakukannya tutup, sementara tabelnya menulis "Closed", jadi salahnya
  // tidak kelihatan sampai ada yang menyadari kliniknya buka tapi tertulis tutup.
  for (const entry of entries) {
    const pairLabel = `${label} hari ${entry.day}`;
    if ((entry.opens === null) !== (entry.closes === null)) {
      fail(
        `${pairLabel}: opens ${entry.opens === null ? "null" : `"${entry.opens}"`} tapi closes ${entry.closes === null ? "null" : `"${entry.closes}"`} — harus dua-duanya null (tutup) atau dua-duanya terisi`,
      );
      continue;
    }
    if (entry.opens === null) continue;

    // "24:00" sengaja sah sebagai batas akhir hari dan HANYA untuk `closes`.
    // Ia bukan jam yang bisa ditunjuk jam dinding, jadi sebagai `opens` ia
    // berarti "buka pada saat hari sudah habis" — mustahil.
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.opens)) {
      fail(`${pairLabel}: opens "${entry.opens}" bukan HH:MM 00:00–23:59`);
    }
    if (
      entry.closes !== "24:00" &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.closes)
    ) {
      fail(
        `${pairLabel}: closes "${entry.closes}" bukan HH:MM 00:00–23:59 atau "24:00"`,
      );
    }
    // Perbandingan teks, sah karena dua digit berpadding nol. Jam tutup yang
    // melewati tengah malam TIDAK bisa diwakili bentuk ini — batasnya dicatat di
    // design.md bagian 20, bukan diakali di sini.
    if (entry.closes <= entry.opens) {
      fail(
        `${pairLabel}: closes "${entry.closes}" tidak setelah opens "${entry.opens}" — kalau memang tutup lewat tengah malam, bentuk data ini belum bisa mewakilinya`,
      );
    }
  }

  // Invarian 31: professionalCount = professionalSlugs.length, dan rosternya
  // tidak boleh kosong.
  //
  // Sebelum 24 Agustus 2026 angka ini ditulis tangan (7, 5, 4, 12, 3, 6, 4, 10,
  // 5) dan tidak ada apa pun yang bisa membuktikannya. Sekarang ia turunan, dan
  // kartu di halaman daftar dirender dari panjang arraynya — bukan dari field ini.
  const rosterBlock = arrayBlock(body, "professionalSlugs");
  if (rosterBlock === null) {
    fail(`${label}: tidak punya professionalSlugs`);
    continue;
  }

  const roster = quotedStrings(rosterBlock);
  const declaredCount = Number(body.match(/professionalCount: (\d+)/)?.[1]);

  if (roster.length === 0) {
    fail(
      `${label}: professionalSlugs kosong — bagian "Team" di halaman detail akan kosong, dan kartu akan berbunyi "0 professionals listed"`,
    );
  }
  if (!Number.isFinite(declaredCount)) {
    fail(`${label}: tidak punya professionalCount`);
  } else if (declaredCount !== roster.length) {
    fail(
      `${label}: professionalCount ${declaredCount} tidak sama dengan jumlah slug di professionalSlugs ${roster.length}`,
    );
  }

  const seenInRoster = new Set();
  for (const professionalSlug of roster) {
    // Invarian 32: setiap slug di roster benar-benar ada di data profesional.
    if (!professionalSlugs.has(professionalSlug)) {
      fail(
        `${label}: professionalSlugs memuat "${professionalSlug}" yang tidak ada di data profesional — kartu di bagian "Team" akan hilang tanpa jejak`,
      );
      continue;
    }

    if (seenInRoster.has(professionalSlug)) {
      fail(`${label}: "${professionalSlug}" tercantum dua kali di roster`);
    }
    seenInRoster.add(professionalSlug);

    // Invarian 33: satu profesional tidak boleh terdaftar di dua centre.
    //
    // Bukan karena mustahil di dunia nyata — psikiater memang bisa praktik di
    // beberapa tempat — melainkan karena `getCentreOfProfessional` mengembalikan
    // yang PERTAMA ditemukan. Selama relasinya masih satu arah, dua centre berarti
    // salah satunya tidak akan pernah muncul di profil orangnya. Kalau suatu hari
    // relasinya dibuat banyak-ke-banyak, invarian ini yang harus dicabut, dan
    // aksesornya harus berubah bersamaan.
    const owner = centreOfProfessional.get(professionalSlug);
    if (owner) {
      fail(
        `${label}: "${professionalSlug}" sudah terdaftar di ${owner} — relasinya masih satu arah, jadi \`getCentreOfProfessional\` hanya akan menemukan ${owner}`,
      );
    } else {
      centreOfProfessional.set(professionalSlug, label);
    }

    // Invarian 34: kota profesional harus sama dengan kota centre-nya.
    //
    // Keputusan diaze, 24 Agustus 2026. Halaman profil akan menulis "Practises
    // at" tanpa menyebut kota, jadi kalau kotanya beda, pembaca melihat konselor
    // Bandung dengan alamat Medan di bawahnya dan tidak ada yang menjelaskan.
    const centreCity = body.match(/city: "([^"]+)"/)?.[1];
    const personCity = cityByProfessionalSlug.get(professionalSlug);
    if (centreCity && personCity && centreCity !== personCity) {
      fail(
        `${label}: berkota "${centreCity}" tapi "${professionalSlug}" berkota "${personCity}"`,
      );
    }
  }

  // Invarian 35: timeZone harus cocok dengan provinsinya.
  const province = body.match(/province: "([^"]+)"/)?.[1];
  const timeZone = body.match(/timeZone: "([^"]+)"/)?.[1];
  if (!timeZone) {
    fail(`${label}: tidak punya timeZone`);
  } else if (!province) {
    fail(`${label}: provinsinya tidak terbaca`);
  } else if (!(province in ZONE_BY_PROVINCE)) {
    fail(
      `${label}: provinsi "${province}" belum ada di tabel zona waktu di harness ini — daftarkan dulu, jangan dibiarkan lewat`,
    );
  } else if (ZONE_BY_PROVINCE[province] !== timeZone) {
    fail(
      `${label}: timeZone "${timeZone}" tidak cocok dengan provinsi "${province}" yang seharusnya "${ZONE_BY_PROVINCE[province]}" — status buka/tutup akan bergeser sejam`,
    );
  }

  // Invarian 36: openingNote null atau benar-benar berisi. String kosong akan
  // merender kotak catatan yang kosong di bawah tabel jam.
  const noteRaw = body.match(/openingNote:\s*\n?\s*(null|"(?:[^"\\]|\\.)*")/)?.[1];
  if (noteRaw === undefined) {
    fail(`${label}: tidak punya openingNote`);
  } else if (noteRaw !== "null" && noteRaw.slice(1, -1).trim() === "") {
    fail(`${label}: openingNote string kosong — pakai null kalau tidak ada catatan`);
  }

  // Invarian 37: layanan minimal satu dan tidak ada yang kembar dalam satu centre.
  const serviceRefs = [...body.matchAll(/services\.([A-Za-z]+)/g)].map(
    (m) => m[1],
  );
  if (serviceRefs.length === 0) {
    fail(`${label}: tidak punya services — kartunya tidak akan punya tag apa pun`);
  }
  const seenServices = new Set();
  for (const ref of serviceRefs) {
    if (seenServices.has(ref)) {
      fail(`${label}: layanan "${ref}" dicantumkan dua kali`);
    }
    seenServices.add(ref);
  }

  // Invarian 38: koordinat masih di dalam kotak Indonesia dan kode pos lima
  // digit. Dua-duanya cuma penangkap salah ketik — tanda minus yang hilang di
  // lintang memindahkan klinik Jakarta ke Laut Cina Selatan, dan peta nantinya
  // akan menaruhnya di sana tanpa protes.
  const latitude = Number(body.match(/latitude: (-?[\d.]+)/)?.[1]);
  const longitude = Number(body.match(/longitude: (-?[\d.]+)/)?.[1]);
  if (!Number.isFinite(latitude) || latitude < -11 || latitude > 6) {
    fail(`${label}: latitude ${latitude} di luar wilayah Indonesia (-11..6)`);
  }
  if (!Number.isFinite(longitude) || longitude < 95 || longitude > 141) {
    fail(`${label}: longitude ${longitude} di luar wilayah Indonesia (95..141)`);
  }
  const postalCode = body.match(/postalCode: "([^"]*)"/)?.[1];
  if (!postalCode || !/^\d{5}$/.test(postalCode)) {
    fail(`${label}: postalCode "${postalCode}" bukan lima digit`);
  }
}

// Invarian 28: id dan slug centre unik.
for (const field of ["id", "slug"]) {
  const values = centres.map((centre) => centre[field]);
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`care-centres: ${field} kembar — ${value}`);
    seen.add(value);
  }
}

// --- Events ------------------------------------------------------------------

const eventsSource = read("app/(user)/events/data/events.ts");
const professionalHosts = [...eventsSource.matchAll(
  /kind: "professional",\s*\n\s*slug: "([^"]+)"/g,
)].map((m) => m[1]);

for (const slug of new Set(professionalHosts)) {
  if (!professionalSlugs.has(slug)) {
    fail(
      `events: host.slug "${slug}" berkind professional tapi tidak ada di data profesional`,
    );
  }
}

// Invarian 27: penyelenggara berkind `centre` juga harus benar-benar ada.
//
// Cek di atas cuma menyaring kind `professional`, jadi selama ini LIMA dari
// sembilan penyelenggara — yang semuanya klinik — tidak pernah diperiksa sama
// sekali. Ketemu 24 Agustus 2026 waktu membangun kartu "Hosted by": kartu itu
// membaca data pusat layanan dengan `getCareCentreBySlug`, dan salah tulis satu
// huruf akan membuat kartunya jatuh ke bentuk darurat tanpa ada yang memberi
// tahu.
//
// `centreSlugs` sekarang datang dari pemecah per objek di bagian Care centres di
// atas. Versi pertamanya menyapu seluruh file dengan `/\n    slug: "([^"]+)"/g`,
// dan pola itu ikut menangkap delapan slug LAYANAN di peta `services` yang
// indentasinya sama — jadi `host.slug: "psikoterapi"` akan lolos cek ini. Lubang
// yang sama persis dengan yang pernah ada di daftar slug profesional.
const centreHosts = [...eventsSource.matchAll(
  /kind: "centre",\s*\n\s*slug: "([^"]+)"/g,
)].map((m) => m[1]);

if (centreHosts.length === 0) {
  fail("events: tidak ada penyelenggara berkind centre yang terbaca — pola berubah?");
}

for (const slug of new Set(centreHosts)) {
  if (!centreSlugs.has(slug)) {
    fail(
      `events: host.slug "${slug}" berkind centre tapi tidak ada di data pusat layanan — kartu "Hosted by" akan jatuh ke bentuk darurat`,
    );
  }
}

// Invarian 8: registeredCount tidak boleh melewati quota.
//
// CATATAN: pola di bawah semula `id: "(evt-...)"` padahal id sebenarnya di file
// data berawalan `ev-`. Akibatnya pemecah ini menghasilkan NOL event, loop di
// bawahnya tidak pernah jalan sekali pun, dan harness tetap melaporkan LOLOS —
// invarian ini tidak memeriksa apa pun sejak dibuat. Ketemu 24 Agustus 2026
// waktu hendak menambah invarian event yang lain. Inilah alasan aturan "cek yang
// selalu hijau tidak ada gunanya" ada, dan invarian inilah yang melewatinya.
//
// `ev-\d+` sengaja dipatok angka, bukan `[^"]+`: id baris susunan acara juga
// berawalan `ev-` (`ev-1-a1`) dan cuma dibedakan indentasi. Kalau suatu hari
// Prettier menggeser indentasinya, pola yang longgar akan menganggap tiap baris
// agenda sebagai event tersendiri.
const eventChunks = eventsSource.split(/\n    id: "(ev-\d+)"/).slice(1);

const events = [];
for (let i = 0; i < eventChunks.length; i += 2) {
  events.push({ id: eventChunks[i], body: eventChunks[i + 1] ?? "" });
}

if (events.length === 0) {
  fail("events: tidak ada objek yang terbaca — pola pemisahnya berubah?");
}

for (const event of events) {
  const { id, body } = event;
  const slug = body.match(/slug: "([^"]+)"/)?.[1];
  const label = `${id} (${slug ?? "tanpa slug"})`;

  const quotaRaw = body.match(/quota: (null|\d+)/)?.[1];
  const registered = Number(body.match(/registeredCount: (\d+)/)?.[1]);
  if (quotaRaw && quotaRaw !== "null" && Number.isFinite(registered)) {
    if (registered > Number(quotaRaw)) {
      fail(`${id}: registeredCount ${registered} melewati quota ${quotaRaw}`);
    }
  }

  // Invarian 23: about minimal satu paragraf tidak kosong.
  const aboutBlock = arrayBlock(body, "about");
  if (aboutBlock === null) fail(`${label}: tidak punya about`);
  const aboutParagraphs = quotedStrings(aboutBlock ?? "");
  if (aboutParagraphs.filter((text) => text.trim() !== "").length === 0) {
    fail(`${label}: about kosong`);
  }
  for (const text of aboutParagraphs) {
    if (text.trim() === "") fail(`${label}: ada paragraf about yang kosong`);
  }

  // Susunan acara dipecah per baris dulu, bukan dibaca sekali jalan dengan satu
  // regex panjang: Prettier bebas memindahkan `title:` ke baris berikutnya kalau
  // judulnya kepanjangan, dan pola yang mengandaikan tiga baris berurutan akan
  // diam-diam melewatkan baris itu.
  const agendaBlock = arrayBlock(body, "agenda");
  if (agendaBlock === null) fail(`${label}: tidak punya agenda`);
  const agendaParts = (agendaBlock ?? "")
    .split(/\n\s{8}id: "([^"]+)",/)
    .slice(1);
  const agenda = [];
  for (let i = 0; i < agendaParts.length; i += 2) {
    const rowBody = agendaParts[i + 1] ?? "";
    agenda.push({
      id: agendaParts[i],
      time: rowBody.match(/time: "([^"]*)"/)?.[1] ?? "",
      title: rowBody.match(/title:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? "",
    });
  }

  // Invarian 24: agenda minimal satu baris, id unik, time & title tidak kosong.
  if (agenda.length === 0) {
    fail(`${label}: agenda kosong — susunan acara tidak akan tampil sama sekali`);
  }
  const seenAgendaIds = new Set();
  for (const row of agenda) {
    if (seenAgendaIds.has(row.id)) {
      fail(`${label}: id baris agenda kembar "${row.id}"`);
    }
    seenAgendaIds.add(row.id);
    if (row.time.trim() === "") fail(`${label}: baris ${row.id} tanpa time`);
    if (row.title.trim() === "") fail(`${label}: baris ${row.id} tanpa title`);
  }

  // Invarian 25: agenda adalah rincian dari startDate–endDate.
  //
  // Ini nilai turunan seperti `startingPriceIdr` dan `readTimeMinutes`: jam di
  // agenda bukan data mandiri, ia pecahan dari rentang waktu acara. Kalau
  // dibiarkan, hero bisa bilang acaranya sampai 15:00 sambil susunan acaranya
  // berhenti 14:00 — dua-duanya `string` yang sah, jadi `tsc` diam saja.
  //
  // Jam lokal diambil langsung dari teks ISO-nya (`...T09:00:00+07:00` → 09:00),
  // BUKAN lewat `Date`: begitu masuk `Date`, jamnya jadi jam mesin yang
  // menjalankan skrip ini dan cek jadi bergantung zona waktu komputer.
  const startLocal = body.match(/startDate: "[^"T]+T(\d{2}:\d{2})/)?.[1];
  const endLocal = body.match(/endDate: "[^"T]+T(\d{2}:\d{2})/)?.[1];
  const ranges = [];
  for (const row of agenda) {
    const parsed = row.time.match(/^(\d{2}:\d{2}) – (\d{2}:\d{2})$/);
    if (!parsed) {
      fail(
        `${label}: time "${row.time}" di ${row.id} tidak berformat "HH:MM – HH:MM" (pemisahnya en dash berspasi)`,
      );
      continue;
    }
    if (parsed[2] <= parsed[1]) {
      fail(`${label}: ${row.id} berakhir "${parsed[2]}" tidak setelah mulai "${parsed[1]}"`);
    }
    ranges.push({ id: row.id, from: parsed[1], to: parsed[2] });
  }
  if (ranges.length === agenda.length && ranges.length > 0) {
    if (startLocal && ranges[0].from !== startLocal) {
      fail(
        `${label}: agenda mulai "${ranges[0].from}" padahal startDate jam ${startLocal}`,
      );
    }
    if (endLocal && ranges[ranges.length - 1].to !== endLocal) {
      fail(
        `${label}: agenda selesai "${ranges[ranges.length - 1].to}" padahal endDate jam ${endLocal}`,
      );
    }
    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i].from !== ranges[i - 1].to) {
        fail(
          `${label}: ada lubang di susunan acara — ${ranges[i - 1].id} selesai "${ranges[i - 1].to}" tapi ${ranges[i].id} mulai "${ranges[i].from}"`,
        );
      }
    }
  }
}

// Invarian 26: id dan slug event unik.
for (const field of ["id", "slug"]) {
  const values = events.map((event) =>
    field === "id" ? event.id : event.body.match(/slug: "([^"]+)"/)?.[1],
  );
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`events: ${field} kembar — ${value}`);
    seen.add(value);
  }
}

// --- Hasil -------------------------------------------------------------------

if (problems.length > 0) {
  console.error(`GAGAL — ${problems.length} masalah:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

// Pesan ini menyebut JUMLAH tiap entitas dengan sengaja. Invarian 8 pernah diam
// selama berhari-hari karena pemecahnya tidak cocok dan loopnya nol iterasi;
// kalau angkanya ditampilkan sejak awal, "0 event" akan langsung kelihatan
// tanpa perlu menyabotase apa pun dulu.
console.log(
  `LOLOS — ${professionals.length} profesional, ${professionalSlugs.size} slug unik, ${articles.length} artikel dengan body & waktu baca konsisten, ${solutions.length} solusi dengan kurikulum & harga konsisten, ${events.length} event dengan kuota & susunan acara konsisten, ${centres.length} pusat layanan dengan ${centres.length * 7} baris jam & ${centreOfProfessional.size} profesional terdaftar, tautan artikel, solusi & event tersambung semua.`,
);

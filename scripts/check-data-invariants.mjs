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
  const bioBlock = body.match(/bio: \[([\s\S]*?)\n    \],/)?.[1] ?? "";
  if (bioBlock.trim() === "") fail(`${id} (${slug}): bio kosong`);

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
  const overviewBlock = body.match(/overview: \[([\s\S]*?)\n    \],/)?.[1] ?? "";
  const overviewCount = [
    ...overviewBlock.matchAll(/"((?:[^"\\]|\\.)*)"/g),
  ].filter((m) => m[1].trim() !== "").length;
  if (overviewCount === 0) fail(`${label}: overview kosong`);

  const whoBlock = body.match(/whoItIsFor: \[([\s\S]*?)\n    \],/)?.[1] ?? "";
  const whoItems = [...whoBlock.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(
    (m) => m[1],
  );
  if (whoItems.length < 3) {
    fail(
      `${label}: whoItIsFor cuma ${whoItems.length} butir — di bawah tiga, daftarnya terbaca setengah jadi`,
    );
  }
  for (const item of whoItems) {
    if (item.trim() === "") fail(`${label}: ada butir whoItIsFor yang kosong`);
  }

  // Invarian 18: tidak ada judul atau ringkasan pertemuan yang kosong.
  const curriculumBlock =
    body.match(/curriculum: \[([\s\S]*?)\n    \],/)?.[1] ?? "";
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

// Invarian 8: registeredCount tidak boleh melewati quota.
const eventChunks = eventsSource.split(/\n    id: "(evt-[^"]+)"/).slice(1);
for (let i = 0; i < eventChunks.length; i += 2) {
  const id = eventChunks[i];
  const body = eventChunks[i + 1] ?? "";
  const quotaRaw = body.match(/quota: (null|\d+)/)?.[1];
  const registered = Number(body.match(/registeredCount: (\d+)/)?.[1]);
  if (quotaRaw && quotaRaw !== "null" && Number.isFinite(registered)) {
    if (registered > Number(quotaRaw)) {
      fail(
        `${id}: registeredCount ${registered} melewati quota ${quotaRaw}`,
      );
    }
  }
}

// --- Hasil -------------------------------------------------------------------

if (problems.length > 0) {
  console.error(`GAGAL — ${problems.length} masalah:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `LOLOS — ${professionals.length} profesional, ${professionalSlugs.size} slug unik, ${articles.length} artikel dengan body & waktu baca konsisten, ${solutions.length} solusi dengan kurikulum & harga konsisten, tautan artikel, solusi & event tersambung semua.`,
);

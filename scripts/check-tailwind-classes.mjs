// Cek bahwa setiap kelas Tailwind benar-benar menghasilkan CSS.
// Jalankan: node scripts/check-tailwind-classes.mjs [path...]
//
// Kenapa ini ada: Tailwind TIDAK PERNAH mengeluh untuk kelas yang salah tulis.
// `shadow-crad`, `bg-brand-lavendar-100`, `text-mutted-foreground` — semuanya
// diam saja dan tidak menghasilkan satu baris CSS pun. `tsc` tidak melihatnya
// (isinya cuma string), `eslint` tidak melihatnya, dan di browser hasilnya bukan
// error melainkan elemen yang tampak "hampir benar". Di project ini risikonya
// lebih tinggi dari biasanya karena dua hal: token warnanya bernama sendiri
// (`brand-lavender-200`, `shadow-card-hover`) sehingga tidak ada yang hafal, dan
// Tailwind v4 menyimpan token sebagai CSS variable di `app/globals.css` tanpa
// `tailwind.config.js` untuk diintip.
//
// Cara kerjanya: tiap kelas dikompilasi lewat API Tailwind, lalu CSS hasilnya
// diperiksa — kalau selector kelas itu tidak muncul, kelasnya tidak berarti apa
// pun. Nama kelas harus di-escape gaya CSS sebelum dicari, karena `lg:max-w-md`
// muncul di CSS sebagai `.lg\:max-w-md` dan `text-primary/60` sebagai
// `.text-primary\/60`.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Import lewat path absolut ke dist-nya: `import("tailwindcss")` tidak selalu
// mengekspos `compile` sebagai export publik.
const { compile } = await import(
  resolve(root, "node_modules/tailwindcss/dist/lib.mjs")
);

const targets = process.argv.slice(2);
const scanRoots = targets.length > 0 ? targets : ["app"];

function collectFiles(entry, found = []) {
  const full = resolve(root, entry);
  const stat = statSync(full);
  if (stat.isFile()) {
    if (/\.(tsx|jsx)$/.test(full)) found.push(full);
    return found;
  }
  for (const child of readdirSync(full)) {
    if (child === "node_modules" || child.startsWith(".")) continue;
    collectFiles(join(entry, child), found);
  }
  return found;
}

const files = scanRoots.flatMap((entry) => collectFiles(entry));

// Kumpulkan kandidat kelas. Sumbernya dibatasi tiga tempat saja:
//   1. atribut `className="..."` dan `className={`...`}`
//   2. argumen string di dalam `cn(...)`
//   3. properti `className: "..."` — bentuk yang dipakai `buttonStyles({...})`
//
// Pembatasan ini penting dan pernah salah: versi pertama harness ini juga
// menyapu semua string literal yang "bentuknya seperti kelas", dan hasilnya 24
// laporan palsu — "use client", nama paket impor seperti "lucide-react", nilai
// union seperti "price-asc", sampai "noopener" milik rel. Laporan palsu sebanyak
// itu lebih berbahaya daripada tidak ada cek sama sekali, karena orang berhenti
// membacanya. Konsekuensi yang diterima: kelas yang disusun runtime tidak
// terperiksa. Itu false negative, dan false negative jauh lebih murah di sini.
const candidates = new Map(); // kelas -> Set<file>

for (const file of files) {
  const source = readFileSync(file, "utf8");

  const regions = [
    ...source.matchAll(/className=(?:"([^"]*)"|\{?`([^`]*)`)/g),
    ...source.matchAll(/\bcn\(([\s\S]*?)\)/g),
    ...source.matchAll(/className:\s*"([^"]*)"/g),
  ];

  for (const match of regions) {
    const region = match[1] ?? match[2] ?? "";
    // Di dalam cn(...) yang diambil hanya isi string literal-nya. Ekspresi
    // perbandingan dibuang dulu: `cn(tone === "lavender" ? "bg-brand-lavender-200"
    // : "bg-brand-mint-200")` punya tiga literal, tapi yang pertama nilai prop,
    // bukan kelas — dan tanpa ini `lavender` terlapor sebagai kelas mati.
    const literals = match[0].startsWith("cn(")
      ? [
          ...region
            .replace(/[=!]==?\s*(?:"[^"]*"|`[^`]*`)/g, "")
            .matchAll(/"([^"]*)"|`([^`]*)`/g),
        ].map((m) => m[1] ?? m[2])
      : [region];

    for (const literal of literals) {
      for (const cls of literal.split(/\s+/)) {
        if (cls === "" || cls.includes("${") || cls.includes("{")) continue;
        if (!/^[a-z0-9:[\]/._\-!]+$/i.test(cls)) continue;
        if (!candidates.has(cls)) candidates.set(cls, new Set());
        candidates.get(cls).add(file.replace(`${root}/`, ""));
      }
    }
  }
}

const cssEntry = readFileSync(resolve(root, "app/globals.css"), "utf8");

// Resolusi @import di dalam CSS. Ini bagian yang paling banyak memakan waktu
// waktu harness ini dibuat, jadi dicatat: `app/globals.css` mengimpor tiga hal —
// "tailwindcss", "tw-animate-css", dan "shadcn/tailwind.css" — dan ketiganya
// TIDAK bisa diselesaikan dengan menempelkan nama ke `node_modules/`. Dua yang
// terakhir menaruh alamat file CSS-nya di field `exports` package.json
// (`{"style": "./dist/tw-animate.css"}`), sementara menebak `node_modules/
// tw-animate-css` langsung berujung `EISDIR: illegal operation on a directory`
// karena yang kena baca justru foldernya.
function resolveStylesheet(id, base) {
  if (id.startsWith(".") || id.startsWith("/")) {
    return resolve(base, id);
  }

  const parts = id.split("/");
  const pkg = id.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  const subpath = id.slice(pkg.length + 1);
  const pkgDir = resolve(root, "node_modules", pkg);

  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  } catch {
    // Tanpa package.json, satu-satunya tebakan yang wajar adalah path apa adanya.
    return join(pkgDir, subpath);
  }

  const key = subpath === "" ? "." : `./${subpath}`;
  const entry = manifest.exports?.[key];
  const fromExports =
    typeof entry === "string" ? entry : (entry?.style ?? entry?.default);
  const target = fromExports ?? manifest.style ?? manifest.main;

  if (subpath !== "" && !fromExports) return join(pkgDir, subpath);
  return resolve(pkgDir, target ?? "index.css");
}

const missingImports = [];

const compiler = await compile(cssEntry, {
  base: root,
  loadStylesheet: async (id, base) => {
    const path = resolveStylesheet(id, base);
    try {
      return { base: dirname(path), content: readFileSync(path, "utf8") };
    } catch {
      // Import yang tidak ketemu tidak boleh menjatuhkan harness: tugas file ini
      // mencari kelas mati, bukan memvalidasi graf @import. Tapi juga tidak boleh
      // ditelan diam-diam, karena stylesheet yang hilang bikin kelas yang
      // sebenarnya sah terlaporkan sebagai kelas mati.
      missingImports.push(`${id} (dicari di ${path.replace(`${root}/`, "")})`);
      return { base, content: "" };
    }
  },
});

// `group` dan `peer` memang TIDAK menghasilkan CSS dan itu benar: keduanya cuma
// penanda di DOM supaya varian `group-hover:` dan `peer-checked:` punya sasaran.
// Tanpa pengecualian ini, setiap kartu dan setiap tombol ber-`group` akan
// dilaporkan sebagai kelas mati.
const markerClasses = /^(group|peer)(\/[a-z0-9-]+)?$/;

const escapeClass = (cls) => cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

const dead = [];
for (const [cls, where] of candidates) {
  if (markerClasses.test(cls)) continue;
  const css = compiler.build([cls]);
  if (!css.includes(`.${escapeClass(cls)}`)) {
    dead.push({ cls, where: [...where] });
  }
}

if (missingImports.length > 0) {
  console.warn(
    `PERINGATAN — ${missingImports.length} @import tidak ketemu, hasil di bawah bisa jadi laporan palsu:`,
  );
  for (const item of missingImports) console.warn(`  - ${item}`);
  console.warn("");
}

if (dead.length > 0) {
  console.error(
    `GAGAL — ${dead.length} kelas tidak menghasilkan CSS (kemungkinan salah tulis):\n`,
  );
  for (const { cls, where } of dead) {
    console.error(`  - ${cls}`);
    for (const file of where) console.error(`      ${file}`);
  }
  process.exit(1);
}

console.log(
  `LOLOS — ${candidates.size} kelas dari ${files.length} file, semuanya menghasilkan CSS.`,
);

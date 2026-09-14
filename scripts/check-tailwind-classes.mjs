import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { compile } = await import(
  pathToFileURL(
    resolve(root, "node_modules/tailwindcss/dist/lib.mjs"),
  ).href
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

const candidates = new Map(); 

for (const file of files) {
  const source = readFileSync(file, "utf8");

  const regions = [
    ...source.matchAll(/className=(?:"([^"]*)"|\{?`([^`]*)`)/g),
    ...source.matchAll(/\bcn\(([\s\S]*?)\)/g),
    ...source.matchAll(/className:\s*"([^"]*)"/g),
  ];

  for (const match of regions) {
    const region = match[1] ?? match[2] ?? "";
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
      missingImports.push(`${id} (dicari di ${path.replace(`${root}/`, "")})`);
      return { base, content: "" };
    }
  },
});

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

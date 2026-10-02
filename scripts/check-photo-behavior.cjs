/* eslint-disable @typescript-eslint/no-require-imports */
// Harness ini sengaja CommonJS (.cjs): ia memasang Module._resolveFilename dan
// require.extensions untuk mentranspile berkas .ts asli dari lib/ saat jalan,
// jadi require() adalah mekanisme muatnya, bukan gaya impor yang bisa diganti
// import biasa. Aturan di atas hanya menenangkan pembundel ESLint untuk berkas
// scripts/, bukan kode aplikasi.

const Module = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "mindcaredemo";

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    request = path.join(ROOT, request.slice(2));
  }
  if (!path.extname(request) && (request.startsWith(".") || request.startsWith(ROOT))) {
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      if (fs.existsSync(request + ext)) return request + ext;
    }
  }
  return originalResolve.call(this, request, ...rest);
};

require.extensions[".ts"] = function (module, filename) {
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(compiled, filename);
};

const asset = require(path.join(ROOT, "lib/cloudinary/asset.ts"));
const apply = require(path.join(ROOT, "lib/validations/apply.ts"));

let failures = 0;
const expect = (label, actual, want) => {
  const ok = actual === want;
  if (!ok) failures += 1;
  console.log(`${ok ? "OK   " : "SALAH"} ${label} => ${String(actual)} (harus ${String(want)})`);
};

const CLOUD = "mindcaredemo";
const urlOf = (p) => `https://res.cloudinary.com/${CLOUD}/image/upload/${p}`;

console.log("\n=== isCloudinaryAssetUrl ===");
expect("secure_url widget nyata", asset.isCloudinaryAssetUrl(urlOf("v1712345678/app_data/Professionals/abc.jpg")), true);
expect("host asing", asset.isCloudinaryAssetUrl("https://evil.com/x/a.jpg"), false);
expect("cloud orang lain di host kita", asset.isCloudinaryAssetUrl("https://res.cloudinary.com/someone/image/upload/a.jpg"), false);
expect("bukan resource gambar (raw)", asset.isCloudinaryAssetUrl(`https://res.cloudinary.com/${CLOUD}/raw/upload/a.pdf`), false);
expect("http bukan https", asset.isCloudinaryAssetUrl(`http://res.cloudinary.com/${CLOUD}/image/upload/a.jpg`), false);
expect("bukan URL", asset.isCloudinaryAssetUrl("javascript:alert(1)"), false);
expect("host imitasi berawalan sama", asset.isCloudinaryAssetUrl("https://res.cloudinary.com.evil.com/x/image/upload/a.jpg"), false);

console.log("\n=== isPublicIdInEntityFolder(professionals) ===");
expect("foto profesional sungguhan", asset.isPublicIdInEntityFolder("app_data/Professionals/abc", "professionals"), true);
expect("aset hero admin", asset.isPublicIdInEntityFolder("app_data/Hero/abc", "professionals"), false);
expect("di luar app_data", asset.isPublicIdInEntityFolder("Elsewhere/a", "professionals"), false);
expect("awalan mirip tapi beda folder", asset.isPublicIdInEntityFolder("app_data/ProfessionalsExtra/a", "professionals"), false);

console.log("\n=== canDestroyPublicId ===");
expect("USER hapus foto sendiri", asset.canDestroyPublicId("app_data/Professionals/a", "USER"), true);
expect("USER hapus avatar sendiri", asset.canDestroyPublicId("app_data/Users/Avatars/a", "USER"), true);
expect("USER hapus event company", asset.canDestroyPublicId("app_data/Events/a", "USER"), true);
expect("USER hapus HERO admin", asset.canDestroyPublicId("app_data/Hero/a", "USER"), false);
expect("USER hapus ARTIKEL admin", asset.canDestroyPublicId("app_data/Articles/a", "USER"), false);
expect("USER hapus CareCentre", asset.canDestroyPublicId("app_data/CareCentre/a", "USER"), false);
expect("ADMIN hapus hero", asset.canDestroyPublicId("app_data/Hero/a", "ADMIN"), true);
expect("INSTITUTION hapus care centre", asset.canDestroyPublicId("app_data/CareCentre/a", "INSTITUTION"), true);
expect("peran mana pun di luar app_data", asset.canDestroyPublicId("Elsewhere/a", "ADMIN"), false);
expect("role undefined", asset.canDestroyPublicId("app_data/Hero/a", undefined), false);
console.log("\n=== canDestroyPublicId: folder warisan companies/ ===");
expect("ADMIN hapus logo company lama", asset.canDestroyPublicId("companies/abc123", "ADMIN"), true);
expect("SUPERADMIN hapus logo company lama", asset.canDestroyPublicId("companies/abc123", "SUPERADMIN"), true);
expect("USER TIDAK boleh hapus logo company", asset.canDestroyPublicId("companies/abc123", "USER"), false);
expect("INSTITUTION TIDAK boleh hapus logo company", asset.canDestroyPublicId("companies/abc123", "INSTITUTION"), false);
expect("prefix mirip bukan folder ini (companiesX)", asset.canDestroyPublicId("companiesX/abc", "ADMIN"), false);
expect("folder warisan asing tetap ditolak", asset.canDestroyPublicId("SecretStuff/abc", "ADMIN"), false);
expect("role undefined di folder warisan", asset.canDestroyPublicId("companies/abc", undefined), false);

console.log("\n=== photoAssetIssues (gerbang route) ===");
const goodUrl = urlOf("v1712345678/app_data/Professionals/abc.jpg");
const goodId = "app_data/Professionals/abc";
expect("kosong keduanya (opsional)", JSON.stringify(apply.photoAssetIssues(null, null)), "{}");
expect("undefined keduanya", JSON.stringify(apply.photoAssetIssues(undefined, undefined)), "{}");
expect("url tanpa id", JSON.stringify(Object.keys(apply.photoAssetIssues(goodUrl, null))), '["publicId"]');
expect("id tanpa url", JSON.stringify(Object.keys(apply.photoAssetIssues(null, goodId))), '["photoUrl"]');
expect("pasangan sah", JSON.stringify(apply.photoAssetIssues(goodUrl, goodId)), "{}");
expect("url asing", JSON.stringify(Object.keys(apply.photoAssetIssues("https://evil.com/a.jpg", goodId))), '["photoUrl"]');
expect("id salah folder", JSON.stringify(Object.keys(apply.photoAssetIssues(goodUrl, "app_data/Hero/abc"))), '["publicId"]');



console.log("\n=== ApplyProfessionalSchema / EditProfessionalSchema ===");
const base = {
  fullName: "Sari Wulandari",
  credentials: "M.Psi., Psikolog",
  profession: "Psikolog",
  headline: "Membantu dewasa muda mengelola cemas",
  bio: "x".repeat(70),
  baseCity: "Jakarta Selatan",
  baseProvince: "DKI Jakarta",
  languages: ["Bahasa Indonesia"],
  yearsOfExperience: 5,
  areaSlugs: ["kecemasan"],
  services: [{ name: "Konseling individual", mode: "Online", durationMinutes: 60, priceIdr: 150000 }],
  licenceType: "STR",
  licenceNumber: "STR-12345",
  licenceValidUntil: "2099-12-31",
  acceptTerms: true,
};
const parse = (extra) => apply.ApplyProfessionalSchema.safeParse({ ...base, ...extra });
expect("tanpa kunci foto (opsional)", parse({}).success, true);
expect("pasangan null", parse({ photoUrl: null, publicId: null }).success, true);
expect("string kosong jadi null + kuncinya ada", (() => { const r = parse({ photoUrl: "", publicId: "" }); return r.success && r.data.photoUrl === null && "photoUrl" in r.data; })(), true);
expect("URL asing DITOLAK", parse({ photoUrl: "https://evil.com/a.jpg", publicId: goodId }).success, false);
expect("pasangan sah diterima", parse({ photoUrl: goodUrl, publicId: goodId }).success, true);
expect("EditProfessionalSchema tetap terbentuk (.omit)", typeof apply.EditProfessionalSchema.safeParse, "function");
expect("Edit schema menerima pasangan sah", apply.EditProfessionalSchema.safeParse({ ...base, photoUrl: goodUrl, publicId: goodId }).success, true);
expect("Edit schema membuang kunci yang tak dikirim (dasar penjaga anti-wipe)", "photoUrl" in apply.EditProfessionalSchema.parse(base), false);
expect("Edit schema menahan null eksplisit (penghapusan Foto tetap mungkin)", "photoUrl" in apply.EditProfessionalSchema.parse({ ...base, photoUrl: null, publicId: null }), true);

console.log(`\n${failures === 0 ? "SEMUA LULUS" : failures + " KEGAGALAN"}`);
process.exit(failures === 0 ? 0 : 1);


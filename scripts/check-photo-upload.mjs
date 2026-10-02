
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(join(root, relative), "utf8");

const problems = [];
let checksRun = 0;
const check = (label, condition) => {
  checksRun += 1;
  if (!condition) problems.push(label);
};

const schema = read("lib/validations/apply.ts");
const applyRoute = read("app/api/apply/professional/route.ts");
const dashboardRoute = read("app/api/dashboard/professional/route.ts");
const form = read("app/apply/professional/ProfessionalForm.tsx");
const destroyRoute = read("app/api/cloudinary/destroy/route.ts");
const deleteRoute = read("app/api/cloudinary/delete/route.ts");

const professionalBlock = schema.slice(
  schema.indexOf("export const ApplyProfessionalSchema"),
  schema.indexOf("export const ApplyCareCentreSchema"),
);
check(
  "ApplyProfessionalSchema kehilangan kunci `photoUrl` — upload akan jadi jalan buntu lagi",
  /\n {2}photoUrl: photoUrlSchema,/.test(professionalBlock),
);
check(
  "ApplyProfessionalSchema kehilangan kunci `publicId` — tanpa ini tidak ada jejak aset untuk membersihkan foto lama",
  /\n {2}publicId: publicIdSchema,/.test(professionalBlock),
);
check(
  "photoUrlSchema menjadi wajib — foto profesional itu opsional, jangan menahan pendaftaran orang tanpa foto",
  /const photoUrlSchema = z\.preprocess\([\s\S]*?\.nullable\(\)\s*\.optional\(\)/.test(
    schema,
  ),
);
check(
  "photoUrlSchema kehilangan gerbang isCloudinaryAssetUrl — URL gambar dari host asing bisa disimpan lalu dimuat peramban pengunjung",
  /refine\(\s*\(val\) => isCloudinaryAssetUrl\(val\)/.test(schema),
);

check(
  "professional.create() tidak menulis photoUrl — foto hilang lagi walau upload berhasil",
  /photoUrl: data\.photoUrl \?\? null,/.test(applyRoute),
);
check(
  "professional.create() tidak menulis publicId",
  /publicId: data\.publicId \?\? null,/.test(applyRoute),
);
check(
  "apply route berhenti memanggil photoAssetIssues — pasangan photoUrl/publicId tidak diverifikasi di server",
  /photoAssetIssues\(data\.photoUrl, data\.publicId\)/.test(applyRoute),
);
check(
  'dashboard route kehilangan penjaga `"photoUrl" in data` — menekan Save akan menghapus foto siapa pun yang punya',
  /"photoUrl" in data \|\| "publicId" in data/.test(dashboardRoute),
);
check(
  "dashboard route tidak lagi menulis photoUrl lewat penjaga photoTouched — assertion positif ini yang menahan bentuk penulisannya",
  /\.\.\.\(\s*photoTouched\s*\?\s*\{\s*photoUrl:\s*nextPhotoUrl,\s*publicId:\s*nextPublicId\s*\}\s*:\s*\{\s*\}\s*\)/.test(
    dashboardRoute,
  ),
);
check(
  "dashboard route kembali menulis photoUrl tanpa syarat di dalam update — inilah yang menghapus foto saat save",
  !/\n {8}photoUrl: data\.photoUrl \?\? null,/.test(dashboardRoute),
);
check(
  "dashboard route berhenti memanggil photoAssetIssues — foto kiriman dashboard tidak diverifikasi",
  /photoAssetIssues\(data\.photoUrl, data\.publicId\)/.test(dashboardRoute),
);
check(
  "dashboard route kehilangan cleanup aset lama (cloudinary.uploader.destroy)",
  /cloudinary\.uploader\.destroy\(replacedPublicId/.test(dashboardRoute),
);
check(
  'ProfessionalForm mengirim kunci `photo:` ke API — skema mengharapkan `photoUrl`',
  !/photo: values\.photo,/.test(form),
);
check(
  "ProfessionalForm tidak mengirim photoUrl ke API",
  /photoUrl: values\.photo === "" \? null : values\.photo,/.test(form),
);
check(
  "ProfessionalForm tidak mengirim publicId ke API",
  /publicId: values\.photoPublicId === "" \? null : values\.photoPublicId,/.test(
    form,
  ),
);
check(
  "Callback widget tidak lagi menangkap public_id — pasangan kunci akan gagal validasi server",
  /setValue\(\s*"photoPublicId",\s*result\.info\.public_id,/.test(form),
);
const photoFieldBlock = form.slice(
  form.indexOf('label="Photo"'),
  form.indexOf('label="Full name"'),
);
check(
  'Field "Photo" ditandai wajib di UI padahal skema mengizinkan kosong',
  !/\brequired\b/.test(photoFieldBlock),
);
check(
  "Pratinjau foto memakai <img> biasa — harus next/image supaya Domain image restriction tidak dilewati",
  !/<img[\s>]/.test(form) && /<Image[\s>]/.test(form),
);
check(
  "/api/cloudinary/destroy kehilangan penjaga folder — user biasa bisa menghapus aset admin",
  /canDestroyPublicId\(publicId, session\.user\.role\)/.test(destroyRoute),
);
check(
  "/api/cloudinary/delete kehilangan penjaga folder",
  /canDestroyPublicId\(publicId, session\.user\.role\)/.test(deleteRoute),
);
check(
  "/api/cloudinary/delete kembali tanpa cek sesi — endpoint ini menandatangani destroy dengan API secret",
  /getServerSession\(authOptions\)/.test(deleteRoute),
);

if (problems.length > 0) {
  console.error(`GAGAL — ${problems.length} masalah pada jalur upload foto:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `LOLOS — ${checksRun} pemeriksaan pada jalur upload foto profesional: skema, create, dashboard (penjaga anti-wipe), form, dan dua endpoint hapus.`,
);


import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import Container from "@/app/components/reusable/Container";
import PageHero from "@/app/components/reusable/PageHero";
import SectionHeader from "@/app/components/reusable/SectionHeader";
import {
  VERIFICATION_LABELS,
  VERIFICATION_POLICY_PATH,
} from "../../data/verification";

// Halaman yang jadi tujuan badge verifikasi. Ditulis 24 Agustus 2026 bersama
// keputusan di `design.md` bagian 21.
//
// TIGA HAL YANG MENENTUKAN ISI HALAMAN INI, dan jangan diubah tanpa memikirkan
// ulang ketiganya:
//
//   1. Sebelum halaman ini ada, badge di enam tempat mengklaim sesuatu tanpa satu
//      pun halaman di belakangnya, dan tautan penjelasannya di footer 404 karena
//      dua sebab sekaligus (halamannya belum ada DAN alamatnya salah tulis:
//      `/help/verificaion-policy`). Jadi halaman ini bukan pelengkap — ia yang
//      membuat badge-nya boleh ada.
//   2. Isinya tidak boleh melebihi apa yang benar-benar dikerjakan. Yang
//      dikerjakan cuma: dokumen dilihat, nomornya dicocokkan ke pangkalan data
//      penerbit, tanggalnya dicatat. Bukan penilaian mutu layanan, bukan
//      penyaringan riwayat keluhan.
//   3. Isi direktori ini masih data contoh, dan BELUM ADA satu pun izin yang
//      betulan diperiksa. Halaman yang menjelaskan proses verifikasi di atas data
//      karangan, tanpa menyebut itu, justru jadi klaim palsu yang paling halus di
//      seluruh situs. Karena itu peringatannya ditaruh paling atas, bukan di
//      catatan kaki.
//
// Nama dokumen sengaja disebut sebagai JENIS ("a national registration
// certificate", "a local practice permit"), bukan singkatan resminya. Bukan demi
// gaya: aturan perizinan kesehatan Indonesia berubah cukup sering, dan usaha
// mengonfirmasi nama-nama terbaru dari sumber pada 24 Agustus 2026 gagal (dua
// pencarian web diblokir). Menyebut jenisnya tetap benar walau singkatannya
// berganti; menyebut singkatan yang belum diperiksa berisiko keliru di halaman
// yang justru soal ketelitian.

export const metadata: Metadata = {
  title: "Verification Policy",
  description:
    "What the licence-checked badge on Mindcare means, what it does not mean, and how long a check lasts.",
};

const lastReviewed = "August 2026";

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export default function VerificationPolicyPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Legal & Safety"
        title="Verification Policy"
        subtitle="What the badge on a listing means, what it deliberately does not mean, and when it goes away."
      />

      <Container>
        <div className="max-w-3xl">
          {/* Peringatan paling atas, bukan paling bawah. Pembaca yang cuma membaca
              satu blok di halaman ini harus membaca blok INI. */}
          <div className="flex gap-4 rounded-xl border border-border bg-brand-lavender-100 p-5">
            <AlertTriangle
              className="size-5 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                Mindcare is still being built
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground/80">
                Every professional, care centre, event, and article on this site
                right now is an example, written to design and test the pages.
                The names are invented. No licence and no operating permit has
                actually been checked yet, and any badge you see is part of the
                example data. Nothing here should be used to choose care.
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground/80">
                This page describes the checks that will run before real listings
                are published. It is written now, before the first submission, on
                purpose: a promise is easier to keep when it was written down
                before anyone had a reason to bend it.
              </p>
            </div>
          </div>

          <section className="mt-14">
            <SectionHeader title="What the badge claims" underline />
            <Prose>
              There are two badges, and they are not the same claim. A person
              carries <strong>{VERIFICATION_LABELS.person}</strong>. A clinic,
              hospital, community health centre, or counselling centre carries{" "}
              <strong>{VERIFICATION_LABELS.facility}</strong>.
            </Prose>
            <Prose>
              Either badge means exactly three things, and nothing beyond them:
              someone at Mindcare looked at the documents; the registration or
              permit number on those documents was matched against the issuing
              body&apos;s own records; and that happened on the date shown next to
              the badge.
            </Prose>
            <Prose>
              The date is part of the claim, not decoration. &ldquo;Checked&rdquo;
              without a date reads like a permanent state, and no check is
              permanent.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="What the badge does not claim" underline />
            <Prose>
              It is not a rating, a recommendation, or a judgement about the
              quality of anyone&apos;s work. Holding a valid licence and being the
              right person to help you are different questions, and only the first
              one is something a document can answer.
            </Prose>
            <Prose>
              It is not a check of complaint or disciplinary history. If that ever
              becomes part of the process, it will be said here plainly and it
              will get its own wording — not folded quietly into an existing
              badge.
            </Prose>
            <Prose>
              It does not transfer. A verified care centre does not make the
              people who practise there verified, and a verified professional does
              not verify the building. Working somewhere is not a credential.
              That is why the two badges are worded differently even when they sit
              on the same page.
            </Prose>
            <Prose>
              It is not a guarantee of availability, price, or fit, and it is not
              a safety assessment.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="How a person is checked" underline />
            <Prose>
              First, that the person asking for the listing is the person the
              documents belong to. This step is separate from the document check
              and cannot be skipped by having the documents. Copies of
              registration certificates circulate widely — through job
              applications, insurer credentialing, permit paperwork — so holding a
              copy proves nothing about whose it is.
            </Prose>
            <Prose>
              Then the documents themselves: a national registration certificate
              for the profession, and a local permit to practise, which is issued
              for a named place of practice and carries an expiry date. Membership
              of a professional association can be submitted as well, but it is
              treated as supporting information, not as the licence.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="How a facility is checked" underline />
            {/* Akreditasi sengaja dikeluarkan dari dasar badge, dan ini bukan
                soal gaya menulis. Akreditasi adalah PENILAIAN MUTU oleh lembaga
                lain. Kalau ia ikut jadi dasar badge, badge-nya diam-diam memuat
                klaim mutu — padahal dua paragraf di atas halaman ini baru saja
                berjanji tidak menilai mutu. Perlakuannya dibuat sama dengan
                keanggotaan asosiasi di jalur orang: boleh diserahkan, dicatat,
                tapi bukan yang diklaim badge. Ketemu 24 Agustus 2026 waktu
                mengaudit halaman ini terhadap keputusan 2; kalimat sebelumnya
                menyebut akreditasi sederet dengan izin operasional. */}
            <Prose>
              An operating permit for the facility, and a facility registration
              number that can be matched against the health ministry&apos;s public
              records. An accreditation status may be submitted too, but it is
              recorded as supporting information and is not part of what the badge
              asserts — accreditation is a quality judgement made by an accrediting
              body, and this badge deliberately makes none.
            </Prose>
            <Prose>
              For a facility there is also a step proving that whoever is managing
              the listing is authorised to speak for the place — a listing for a
              hospital has no obvious owner, and that is exactly the gap someone
              else could walk into.
            </Prose>
            <Prose>
              Public facilities are a deliberate exception to the rule that a
              check starts with a submission. A community health centre or public
              hospital can be checked by Mindcare directly from the health
              ministry&apos;s open records, with nobody applying on its behalf. The
              reason is a bias we would otherwise build in: if a badge could only
              be earned by applying for it, private clinics with marketing staff
              would collect badges while the most affordable public services went
              unmarked — and that gap would land hardest on the people with the
              least room to pay.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="How long a check lasts" underline />
            <Prose>
              Permits expire. A badge that never expires slowly turns into a lie
              without anyone editing anything, so every check is stored with the
              earliest expiry date among the documents behind it. When that date
              passes, the badge is removed.
            </Prose>
            <Prose>
              A badge is also re-confirmed periodically even while the documents
              are still valid, because the detail most likely to change is not the
              licence — it is where someone practises.
            </Prose>
            <Prose>
              <strong>An absent badge is not an accusation.</strong> A listing with
              no badge may not have applied, may be waiting for review, or may have
              a document whose date has passed. Those are very different
              situations, and none of them is a finding about the person or the
              place. Because the page cannot tell you which one it is, it does not
              guess: the badge is simply not there. Nothing on a public page says
              &ldquo;expired&rdquo; or &ldquo;rejected&rdquo; about anyone.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="What we keep, and what we do not" underline />
            <Prose>
              What is stored against a listing is the outcome of the check, the
              date it happened, and where the record came from. Not the documents
              themselves indefinitely: uploaded files are held only as long as the
              review needs them, are never reachable from the public site, and are
              deleted after that.
            </Prose>
            <Prose>
              Registration and permit numbers are never shown on a public page.
              Once a number is published it cannot be unpublished, and displaying
              it buys the reader nothing they can act on.
            </Prose>
          </section>

          <section className="mt-14">
            <SectionHeader title="If something here looks wrong" underline />
            <Prose>
              A badge on the wrong listing is worse than no badge at all, so
              corrections take priority over new checks. The reporting channel is
              not open yet — like the rest of the site, it is still being built,
              and pointing you at an address that nobody reads would be its own
              small dishonesty. It will be linked from this page and from the
              footer as soon as it works.
            </Prose>
            <Prose>
              In an emergency, do not wait for a directory. Contact local
              emergency services or go to the nearest hospital.
            </Prose>
          </section>

          {/* Tidak ada tautan "Back to Help" di sini, dan itu disengaja.
              `/help` masih halaman sisa Executive Corner yang HIDUP (bukan
              dikomentari seperti privacy-policy): gaya abu-abu mentah, dan
              seluruh kartu topiknya menunjuk ke `/help/<topic>` yang 404.
              Menautkan ke situ dari halaman yang isinya soal tidak
              mengklaim-lebih justru menjatuhkan pembaca ke tautan mati.
              Pasang tautannya setelah `/help` dibereskan. */}
          <div className="mt-14 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Last reviewed: {lastReviewed}. This page is versioned with the site;
              when the wording of a badge changes, this page changes in the same
              edit.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Penjaga kecil supaya alamat halaman ini dan konstanta yang dipakai badge tidak
// pernah menyimpang. Kalau `VERIFICATION_POLICY_PATH` diubah tanpa memindahkan
// foldernya, build gagal di sini — bukan diam-diam jadi tautan 404 yang cuma
// ketemu kalau ada yang mengkliknya.
const _pathGuard: "/help/verification-policy" = VERIFICATION_POLICY_PATH;
void _pathGuard;

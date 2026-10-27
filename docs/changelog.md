# Changelog

A running record of changes made to this repository outside the product's own
feature work, grouped by date. Each entry names the files touched and why, so a
later reader can see what moved and can revert a single concern.

---

## 2026-10-21

### Homepage hero slideshow

Added an image slideshow with a wipe transition to the homepage hero, managed
from the admin console.

| File | Change |
|---|---|
| `app/components/reusable/HeroWipeSlideshow.tsx` | New. Slide renderer, transform-only wipe, autoplay with pause, keyboard support, reduced-motion crossfade, `next/image` layers |
| `app/(user)/page.tsx` | Reads active `HeroSlider` rows and maps them to slides |
| `app/(user)/home/Home.tsx` | Renders the slideshow when slides exist, otherwise the previous `PageHero` |
| `app/components/SideMenuAdmin.tsx` | Added the "Hero Slides" entry under a new "Content" section |
| `app/cadmin/hero/components/HeroForm.tsx` | Rewritten to the admin design system; uses `ImageUploadField`; Title, Description, Alt text, Button, Order, Visibility |
| `app/cadmin/hero/components/HeroList.tsx` | Rewritten as a card list with thumbnail, status, edit and delete |
| `app/cadmin/hero/page.tsx`, `create/page.tsx`, `edit/[id]/page.tsx` | Page shells, loading and error states |
| `app/components/reusable/ImageUploadField.tsx` | Added opt-in `deferDelete` and `onDiscard` props |
| `prisma/schema.prisma` | No change. Existing `HeroSlider` fields `title`, `subtitle`, `description`, `alignText` are reused; `subtitle` now holds alt text |

Also fixed: updating a slide previously sent no `id` in the request body, while
`PUT /api/hero` requires it, so every edit failed with a 400.

Documentation for this area: `docs/hero-carousel.md`.

### Homepage content

| File | Change |
|---|---|
| `app/(user)/home/section/AboutPlatform.tsx` | New. Short introduction to the platform, plus what the licence-check labels mean |
| `app/(user)/home/Home.tsx` | Added the intro section; passed homepage-specific empty states; fixed the lowercase "solutions" heading; removed two mangled dashes |
| `app/(user)/components/Footer.tsx` | Replaced the paragraph describing an exhibition and conference with an accurate description of the directory; fixed a mangled copyright sign |
| `app/(user)/professionals/section/ProfessionalsGrid.tsx` | Optional `emptyState` prop; copy no longer talks about filters on the homepage |
| `app/(user)/care-centres/section/CareCentresGrid.tsx` | Same, plus fixed a sentence missing its punctuation |
| `app/(user)/solutions/section/SolutionsGrid.tsx` | Same optional prop |
| `app/(user)/events/section/EventsCardGrid.tsx` | Same optional prop |
| `app/(user)/help/report-concern/page.tsx` | Fixed a mangled dash |

### Homepage intro section, second pass

The first version of the intro section was two plain text columns. It was
rebuilt to carry more depth and to hold up across widths.

| File | Change |
|---|---|
| `app/(user)/home/section/AboutPlatform.tsx` | Rewritten: tinted lavender band, three seeker-facing points with relevant icons, an offset layer behind the label panel for depth, three responsive states (one column, points in two columns, asymmetric two columns with the panel) |

Decisions and why:

- The tinted band breaks the run of white sections, which is the cheapest way to
  add rhythm without introducing an asset.
- No new imagery: an image here would have to be invented, and the section works
  from real content (the verification labels come from `VERIFICATION_LABELS`).
- No scroll animation. Motion is the hero's job on this page, and the remaining
  sections are static; adding motion to one more section would read as a
  template move rather than a decision.


### Ticket email QR code

The ticket email showed the caption "Present this QR Code at the check-in desk"
with no image. The email `Image` component emitted a React-style `<Image>` tag
into an HTML string, which no mail client renders.

| File | Change |
|---|---|
| `lib/mail/components/Image.ts` | Emits a real `<img>` with fixed dimensions |
| `lib/mail/templates/ticket.ts` | Uses the stored QR data URL via `cid:` when available, otherwise the `/api/tickets/qr/{code}` URL |
| `lib/mail/senders/ticket.ts` | Attaches the QR inline with a content id |
| `lib/mail/types.ts`, `lib/orders/sendTicketEmails.ts` | Pass the stored QR data URL through |

---

## Encoding defect, not yet fixed

Source files contain double-encoded UTF-8, which the browser renders as
garbage. Confirmed examples:

- `app/(user)/components/Footer.tsx` (fixed here)
- `app/(user)/home/Home.tsx` (fixed here)
- `app/(user)/help/report-concern/page.tsx` (fixed here)
- `app/(user)/help/verification-policy/page.tsx`, `app/(user)/help/section/NotPublishedYet.tsx`, `app/(user)/care-centres/*`, `app/(user)/events/*`, `app/(user)/insights/data/articles.ts` and others

A scan across `app/` and `lib/` found roughly 240 lines carrying the sequences
`a-circumflex + euro + smart-quote`, `a-circumflex + euro + trademark`, and
`A-circumflex + copyright-sign`. They should be repaired file by file with a
UTF-8 safe editor, not by a string-replacement script, because rewriting a file
with the wrong encoding can damage the rest of its content.

---

## Dead legacy files from another product

These files belong to a different brand (Execorner) and are imported by nothing.
They were found while working on the homepage and left in place because deleting
them is the repository owner's decision.

| File | Problem |
|---|---|
| `app/(user)/section/AboutSection.tsx` | Execorner copy, `/images/HRDI.jpg`, hardcoded statistics (10000 professionals, 500 events, 100 experts) |
| `app/(user)/section/VisionSection.tsx` | Execorner copy, hardcoded DM Sans and Playfair Display |
| `app/(user)/section/PartnerSection.tsx` | Execorner partner section |
| `app/(user)/section/HeroSection.tsx` | Scratch file with demo buttons ("Simpan", "Clear", "spam", "Hapus") and an "Upcoming Events" heading |
| `app/(user)/section/ContactSection.tsx` | Unused; the homepage uses `app/(user)/home/section/ContactSection.tsx` |
| `app/(user)/components/CountUp.tsx` | Only used by the dead `AboutSection` |
| `public/images/HRDI.jpg` | Image of the other brand |

Two risks if any of this is ever wired up by mistake: another company's branding
appears on MindCare, and the invented statistics violate the project rule
against numbers without a real source.


# Homepage hero slideshow

The homepage hero can run as an image slideshow with a wipe transition. It is
the only place this component is used.

| Item | Value |
|---|---|
| Component | `app/components/reusable/HeroWipeSlideshow.tsx` |
| Used by | `app/(user)/home/Home.tsx` |
| Admin screen | `/cadmin/hero` (list), `/cadmin/hero/create`, `/cadmin/hero/edit/[id]` |
| API | `app/api/hero/route.ts` (GET, POST, PUT, DELETE) |
| Model | `HeroSlider` in `prisma/schema.prisma` |
| Images | Cloudinary folder `app_data/Hero`, admin-only (`lib/cloudinary/folders.ts`) |

If no slide is active, the homepage falls back to the plain `PageHero` block
that was there before the slideshow existed.

## Behaviour

Text and buttons are optional per slide. When a field is empty the homepage
default is used instead.

| Slide field | Fallback when empty |
|---|---|
| `title` | Homepage default title ("Mental health support, all in one place") |
| `description` | Homepage default paragraph |
| `buttonText` + `buttonUrl` | The two default buttons ("Find a professional", "Browse care centres") |
| `subtitle` | Used as the image `alt` text only while the slide shows no title or description |

Two consequences worth knowing:

- **Filling `title` replaces the homepage `h1`.** The slideshow always renders
  exactly one `h1`: the current slide's title if it has one, otherwise the
  default title. Leave `title` empty to keep the default heading.
- **A slide with its own title or description makes the image decorative.** The
  image gets an empty `alt` in that case, because the text already carries the
  meaning.

## Images

- Rendered with `next/image` (`fill`, `sizes="100vw"`, `object-cover`).
- Only two layers are mounted at once: the visible slide and the next one, so
  the number of slides does not change the initial payload.
- Upload at least 1920px wide. The upload pipeline resizes to a maximum of
  1600px and converts to WebP.
- The reveal layer uses `loading="eager"` on purpose. Lazy loading relies on
  `IntersectionObserver`, and an element moved out of the viewport with
  `transform` counts as not visible, so a lazy image would load exactly when the
  wipe starts and flash.

## Motion

- The wipe animates `transform` only: a clipping window translates while the
  image inside counter-translates by the same amount, so the image looks still
  and only its edge moves. Transform-only keeps the work on the compositor
  instead of repainting the layer every frame.
- Autoplay pauses when the section leaves the viewport, and while the pointer or
  keyboard focus is inside it.
- `prefers-reduced-motion` switches the wipe to a short crossfade instead of
  movement.
- The active indicator doubles as a progress bar, and each indicator has a 44px
  tap target.

## Cloudinary cleanup

Old images are removed only after the form saves successfully:

- Replace or remove an image, then **save**: the discarded asset is deleted.
- Replace or remove an image, then **cancel** or leave the page: only assets
  uploaded during that visit are deleted, the asset stored in the database is
  kept.
- Deletion is best effort. If it fails, the only effect is an unused asset left
  in Cloudinary.

`ImageUploadField` supports this through the `deferDelete` and `onDiscard`
props. They default to off, so other forms that use the component keep deleting
on upload.

## Gotchas

- The slide button link must point to a page that exists. The admin form does
  not verify routes, so a typo creates a dead button.
- A slide with an empty `title` shows the homepage default copy, which is the
  intended way to keep the brand heading.

# Dimo Guitars Website: Build Brief for Cursor

> Put this file in the project root. Start every Cursor chat with: "Read CURSOR_BRIEF.md first and follow it."
> Goal for v1 (tonight): a clean, fast, multi-page **scaffold** live on **www.dimoguitars.com**, with all 46 guitars in the Store and a working mailing-list signup. Specs, prices and Reverb links get filled in later from `inventory.csv`, and the site rebuilds from that data automatically.

---

## 1. What we're building

A brand + catalog site for **Dimo Guitars**: handmade electric guitars built by Dimo in his Long Island, NY workshop.
- **Not a checkout.** Sales happen on **Reverb**. Each guitar page links out to its Reverb listing when one exists; otherwise it shows an "Inquire" email button.
- Tagline: **"The Spirit of Tradition. The Art of Originality."**
- Tone: refined, quiet, craft-focused. Inspired by the violin-making tradition. Think a premium luthier, not a big-box guitar store.

## 2. Tech stack (don't substitute)

| Concern | Choice |
|---|---|
| Framework | **Astro** (latest), static output (`output: 'static'`) |
| Styling | **Tailwind CSS** + a few CSS variables (section 6) |
| Images | Astro `<Image>`/`<Picture>` from `astro:assets` (AVIF/WebP, responsive `widths`, lazy loading) |
| Data | `src/data/inventory.csv` (one row per guitar) + `src/data/models.ts`. Parse the CSV at build time with a tiny parser (e.g. `papaparse` or a hand-rolled split, since there are no commas inside fields) |
| Fonts | Self-hosted via **Fontsource**: `Cormorant Garamond` (headings), `Inter` (body) |
| Sitemap/SEO | `@astrojs/sitemap`; `site: 'https://www.dimoguitars.com'` |
| Hosting | **Netlify** (static; build `npm run build`, publish `dist`) |
| Mailing list | **EmailOctopus** inline embed form (script tag provided later; build a placeholder component now) |
| JS | Minimal. Vanilla JS only for: mobile menu, gallery lightbox, store filter. No React. |

Keep it simple: no CMS, no backend, no database, no analytics yet.

## 3. Site map & navigation

Top nav (keep this order and these labels):

**Home · About · Guitars · Workshop & Tools · Jigs & Templates · Contact · Store**

| Route | Purpose |
|---|---|
| `/` | Home |
| `/about` | Dimo's bio + The Philosophy (three signature elements) |
| `/guitars` | The five models overview |
| `/guitars/[model]` | One page per model (`d`, `m`, `r`, `rc`, `dh`): description + grid of that model's guitars |
| `/workshop` | Workshop & Tools |
| `/jigs` | Jigs & Templates |
| `/contact` | Inquiries + mailing list |
| `/store` | All 46 guitars, filterable by model |
| `/store/[id]` | One page per guitar (`/store/d-101`, `/store/dh-003` …) |
| `/privacy` | Short privacy policy (required because we collect emails) |
| `404` | Friendly not-found page with link to Store |

Header: Dimo signature logo (left) + nav (right). Mobile: hamburger → full-screen menu.
Footer: logo, tagline, nav links, mailing-list signup, `dimoguitarsnyc@gmail.com`, "Long Island, NY", social icons (Facebook / YouTube / Instagram; URLs as TODO placeholders), `© {current year} Dimo Guitars`, link to Privacy.

## 4. Data model

### Models: `src/data/models.ts`
Full model names aren't decided yet. Use the code as the display name for now (`"D"`, `"M"`, `"R"`, `"RC"`, `"DH"`) with `fullName` = `"Dimo D"` etc., and a `description` placeholder: `"Description coming soon."`. The shape:

```ts
export const models = [
  { code: 'D',  slug: 'd',  fullName: 'Dimo D',  description: 'Description coming soon.', specs: {} },
  { code: 'M',  slug: 'm',  fullName: 'Dimo M',  description: 'Description coming soon.', specs: {} },
  { code: 'R',  slug: 'r',  fullName: 'Dimo R',  description: 'Description coming soon.', specs: {} },
  { code: 'RC', slug: 'rc', fullName: 'Dimo RC', description: 'Description coming soon.', specs: {} },
  { code: 'DH', slug: 'dh', fullName: 'Dimo DH', description: 'Description coming soon.', specs: {} },
] as const;
```
`specs` is a key→value map rendered as a 2-column spec table (Body, Neck, Fretboard, Number of Frets, Scale Length, Neck Width at Nut, Neck Width at Body, Truss Rod, Pickups, Controls, Switching, Fretboard Radius). Hide the table when empty.

### Guitars: `src/data/inventory.csv`
Columns: `id,model,status,price,reverb_url,featured,finish,top_wood,body_wood,neck_wood,fretboard,pickups,notes`
- `id`: e.g. `D-101`, `DH-003`. URL slug = lowercase id.
- `model`: `D | M | R | RC | DH` (must match `models.ts`; fail the build loudly if not).
- `status`: `available | sold | hold | not-for-sale`.
- `price`: number in USD, blank allowed.
- `reverb_url`: blank allowed.
- `featured`: `true/false` (Home page "Featured" row).
- Remaining columns: blank allowed; only render rows that have values.

Inventory today: **46 guitars**: D-101…D-115 (15), DH-001…DH-005 (5), M-101…M-108 (8), R-101…R-108 + R-110 (9; there is no R-109), RC-101…RC-109 (9).

## 5. Photos

Source (outside the repo): `~/Desktop/DimoGuitarsWebsite/Photos/InventoryPhotos/<ID>/`. Each folder has exactly 6 files:

| Order | File suffix | Role |
|---|---|---|
| 1 | `_Front_Full_Body.jpg` | **Primary** (store card, OG image) |
| 2 | `_Back_Full_Body.jpg` | Store card hover image |
| 3 | `_Front_Body_Crop.jpg` | Gallery |
| 4 | `_Back_Body_Crop.jpg` | Gallery |
| 5 | `_Side_Body.jpg` | Gallery |
| 6 | `_Headstocks.jpg` | Gallery (note the plural) |

Example: `D-101/D-101_Front_Full_Body.jpg`.

**Build `scripts/import-photos.mjs`** (run with `npm run photos`):
- Takes the source folder path as an argument.
- For each guitar folder, resizes each image to **max 2000px on the long edge, JPEG quality 82** with `sharp`, and writes to `src/assets/guitars/<ID>/<ID>_<Angle>.jpg` (same names).
- Prints a report: guitars found, any folder missing any of the 6 angles, any folder not present in `inventory.csv` and vice versa.
- Load images in pages with `import.meta.glob('/src/assets/guitars/**/*.jpg', { eager: true })` and map them by id + angle. A missing photo should show a neutral placeholder, not crash the build.

Alt text pattern: `"Dimo D-101 handmade electric guitar, front"`.

Logos: `Photos/DimoSignature…transparent.png` (dark and white versions) → copy to `src/assets/brand/`. Use the dark one on light backgrounds, the white one on dark sections.

## 6. Design direction

References: Fender and Gibson product pages (clean grids, products on soft gray, generous white space) + the warmth and heritage of a luthier's workshop. The old site's navy/cream palette was the brand; keep the **navy as a heritage accent**, but modernize everything else.

```css
:root {
  --paper:    #FAF8F5;  /* page background, warm off-white */
  --ink:      #1A1A1A;  /* body text */
  --muted:    #6B6B6B;  /* secondary text */
  --navy:     #1C3A5E;  /* heritage accent: header bar on scroll, footer, links */
  --brass:    #B08D57;  /* small accents: rules, hover states (echoes gold hardware) */
  --photo-bg: #EBEBEB;  /* MUST match the gray of the product photos; TODO verify */
}
```
- **Product cards and gallery frames use `--photo-bg`** so the photo edges vanish into the card (no visible box). Product photos are 5:7 portrait (full body). Keep `object-fit: contain` on that background.
- Typography: Cormorant Garamond for H1–H3 (large, light weight, generous letter-spacing on small caps labels); Inter 16–18px body, line-height 1.6, max line length ~70ch.
- Layout: max content width ~1200px; sections separated by space, not boxes. No drop shadows except a very soft one on card hover.
- Motion: subtle only (fade/slide 150–250ms; card image crossfade to back photo on hover). Respect `prefers-reduced-motion`.
- Accessibility: WCAG AA contrast, visible focus states, keyboard-operable menu and lightbox, semantic headings.

## 7. Page specs

### Home `/`
1. **Hero**: full-width image (use a `_Front_Body_Crop` or `_Side_Body` photo of a featured guitar as a placeholder), H1 "Dimo Guitars", tagline, buttons: "Explore the Store" → `/store`, "Our Philosophy" → `/about`.
2. **Three signature elements**: three cards linking to sections on `/about`:
   - Signature Asymmetric 22° Set-Neck Joint: "Original engineering in the spirit of tradition."
   - Signature Inset Carved Maple Top: "The natural beauty of wood, uninterrupted."
   - Signature Sculpted Headstock: "The crown of the instrument."
   (Use `_Back_Body_Crop`, `_Front_Body_Crop`, `_Headstocks` photos as placeholders.)
3. **Featured guitars**: up to 4 with `featured=true` (fallback: first 4 available).
4. **Models strip**: five model tiles → `/guitars/[model]`.
5. **Mailing list** block: "Be the first to see new instruments."

### About `/about`
1. **About Dimo** (bio + portrait placeholder). Draft copy from the old site, use as-is for now:
   > Initially a fine artist trained in Europe and at New York's National Academy of Fine Arts, Dimo discovered his passion for guitar making in the 1990s. His eye for detail led him to innovate in both design and construction.
   >
   > Over three decades, Dimo has refined his craft in his Long Island workshop, creating specialized tools and jigs that bring consistent precision to every guitar he builds.
2. **The Philosophy**: render `content/copy/DGPhilosophy.md` (import the markdown; keep its headings). Give each of the three "Signature …" H2s an `id` (`neck-joint`, `maple-top`, `headstock`) for deep links, and a placeholder image beside each section.
3. Closing tagline + "Explore the Store" button.

### Guitars `/guitars` and `/guitars/[model]`
- Overview: five model cards (photo = first available guitar's Front_Full_Body, name, count "15 instruments", link).
- Model page: H1 model name, description, spec table (hidden if empty), "Signature features" list linking to the About anchors, then the grid of that model's guitars (same card as Store).

### Store `/store`
- Header: "The Collection": short line: "Every instrument is handmade and one of a kind."
- Filter chips: All · D · M · R · RC · DH (vanilla JS, updates `?model=` in the URL; works without JS by showing all).
- Grid: 2 cols mobile, 3 tablet, 4 desktop. **Card**: Front_Full_Body on `--photo-bg` (crossfade to Back_Full_Body on hover), id (e.g. "D-101"), model name, price or "Price on request", status badge if `sold`/`hold`.
- Sort: model order D, M, R, RC, DH, then id.

### Guitar detail `/store/[id]`
- Left: gallery (large main image + 6 thumbnails, in the order in section 5; click → lightbox with arrows/Esc/swipe).
- Right: model name + id as H1 ("Dimo D · D-101"), price or "Price on request", status, **CTA logic**:
  - `reverb_url` present and status `available` → primary button **"Buy on Reverb"** (new tab, `rel="noopener"`), plus secondary "Ask a question" (mailto).
  - no `reverb_url`, status `available` → primary button **"Inquire"** → `mailto:dimoguitarsnyc@gmail.com?subject=Inquiry: Dimo D-101`.
  - `sold` → "Sold" badge + "Ask about a similar instrument" (mailto).
- Details table from the non-empty CSV fields; then the model's spec table; then "Signature features" links.
- "More from the D series" row (up to 4 others).
- Per-page `<title>`: "Dimo D-101 | Handmade Electric Guitar | Dimo Guitars"; OG image = Front_Full_Body.

### Workshop & Tools `/workshop`
Intro copy (from old site): "Dimo's workshop is devoted to preserving the spirit of hand-building guitars that bear the mark of their maker. Hand tools such as files, chisels and handsaws, alongside routers, planers and band saws, are used in place of CNC machines or other programmable tools." Then a photo-gallery placeholder (6 gray tiles) and a video placeholder (YouTube embed slot, lazy-loaded via `lite-youtube` style facade).

### Jigs & Templates `/jigs`
Intro placeholder ("Original jigs and templates, designed by Dimo and built specifically for these guitars…") + four sections with two image slots each: Neck-to-Body Jigs · Fretboard Radius Jig · Fret Slotting Jig · Truss Rod Jig. Placeholder images for now.

### Contact `/contact`
"For inquiries", email link `dimoguitarsnyc@gmail.com`, location "Long Island, NY" (no street address), phone **omitted for now** (TODO), mailing-list block, social links.

### Privacy `/privacy`
Plain-language placeholder: what we collect (email, via EmailOctopus, for occasional updates), unsubscribe anytime, we don't sell data, contact email. Mark `TODO: review`.

## 8. Mailing list component

`src/components/Newsletter.astro`: heading, one sentence, and an EmailOctopus **inline** form embed. Until the embed script is pasted in, render a disabled-looking placeholder form with the note "Mailing list coming soon". Keep the embed in **one** component used in Home, Contact and the footer (EmailOctopus free plan allows one form).

## 9. Quality bar / definition of done (v1)

- `npm run build` passes with zero errors; the photo report shows 46/46 guitars × 6 photos.
- Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 on Home, Store and one guitar page.
- All 46 `/store/[id]` pages and 5 `/guitars/[model]` pages generate.
- No layout shift from images (width/height set); images lazy-load below the fold.
- Works at 375px wide; no horizontal scroll.
- `netlify.toml` present: build command, publish dir, and a redirect from apex to `www`.
- `README.md` explains: how to add photos (`npm run photos`), how to edit `inventory.csv`, how to deploy (push to `main`).

## 10. Out of scope for v1

Checkout/cart, Reverb API sync (later: pull price/status from Reverb at build time), CMS, blog, analytics, multi-language, dark mode.

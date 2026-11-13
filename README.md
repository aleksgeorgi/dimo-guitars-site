# Dimo Guitars website

The site for [www.dimoguitars.com](https://www.dimoguitars.com): a static [Astro](https://astro.build) site with Tailwind, built from a CSV of guitars and a folder of photos. Netlify builds and hosts it.

## Run it locally

Needs Node 22.23.4 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # dash check, then the production build into dist/
npm run preview   # serve dist/ locally
```

The build fails on purpose if any file in `src/` or `content/` contains an em dash or en dash (`scripts/check-dashes.mjs`), or if `inventory.csv` has an unknown model, unknown status or a malformed price. The error message names the file and line.

## Add or replace guitar photos

Originals live outside this repo, in `../Photos/InventoryPhotos/<ID>/`. Each guitar needs these six files, named exactly:

```
<ID>_Front_Full_Body.jpg
<ID>_Back_Full_Body.jpg
<ID>_Front_Body_Crop.jpg
<ID>_Back_Body_Crop.jpg
<ID>_Side_Body.jpg
<ID>_Headstocks.jpg
```

Then run:

```sh
npm run photos            # resize into src/assets/guitars/<ID>/ and print a report
npm run photos -- --force # rewrite every photo, even unchanged ones
```

The script only rewrites photos that changed, and the report lists missing angles, unexpected files and IDs that are in the CSV but have no folder. Commit the resized files in `src/assets/guitars/`, never the originals.

To keep an earlier edit, move it into a subfolder such as `Photos/InventoryPhotos/<ID>/Old/`. The script skips subfolders, and a re-export must use the exact name above to be picked up.

In `npm run dev`, a replaced photo can keep showing the old version until you clear the browser cache. The live site always serves the new one.

## Edit guitars: `src/data/inventory.csv`

One row per guitar. No commas inside fields.

| Column | Values |
|---|---|
| `id` | `D-101`, `DH-003`, … The page is `/store/<id in lowercase>`. |
| `model` | `D`, `M`, `R`, `RC` or `DH` (defined in `src/data/models.ts`) |
| `status` | `available`, `sold`, `hold` or `not-for-sale` |
| `price` | Whole USD with no symbols, e.g. `4000`. Blank shows "Price on request". Sold guitars show "Sold". |
| `reverb_url` | Blank for now. When set on an available guitar, its page shows "Buy on Reverb" in place of "Join the mailing list". |
| `featured` | `true` for up to four guitars shown on the Home page. The first one also supplies the Home hero photo. |
| `finish` … `pickups` | Optional specs. Filled ones appear in "The instrument" table. |
| `notes` | Optional description for the guitar page. |

When the Reverb shop opens, also update the "store coming soon" notes on `/store` (`src/pages/store/index.astro`) and on guitar pages (`src/pages/store/[id].astro`).

## Show a hidden page: `src/data/site.ts`

`pages` controls the nav. Set `show: true` to put a page in the header and footer, include it in the sitemap and drop its `noindex`. Hidden pages (Workshop & Tools, Jigs & Templates, Contact) still build as "Coming soon" placeholders, but nothing links to them.

`site.ts` also holds the contact email, the location label, the guitar whose photos illustrate the signatures on Home and About (`aboutGuitarId`), and social links (each one appears once its URL is filled in).

## Text

- About page: `content/copy/DGPhilosophy.md`. Keep its shape: a `#` title, an italic tagline and the general philosophy; then a `##` About section; then a `##` signature contributions section with an intro and three `###` items, each with an optional italic subtitle. The build fails with a clear message if the shape changes.
- Copy rules: no em or en dashes; the location label is "NY, NY" ("New York" inside sentences).

## Guitars page: `src/data/models.ts`

The Guitars page (`/guitars`) is built from `src/data/models.ts`. For each model:

- `showcase` is the guitar whose photos represent the model.
- `description` is empty for now. Fill it in and it appears under the model name.
- `specs` are the model-level facts (neck joint, headstock, body, pickups). An `href` links a spec to its section on the About page.

`families` in the same file controls how models are grouped on the page (RC and DH share the Heritage section).

## Mailing list and contact form

- **Mailing list:** paste the EmailOctopus inline form embed into the `embed` string in `src/components/Newsletter.astro`. Until then the footer shows a disabled form with "Mailing list coming soon".
- **Contact form** ("Write to Dimo", in the footer): a Netlify form named `contact`. In the Netlify dashboard, turn on form detection, then add an email notification to dimoguitarsnyc@gmail.com under Site configuration → Notifications → Form submission notifications. It only works on the deployed site, not locally.

## Deploy

Push to `main`. Netlify builds with the settings in `netlify.toml` (`npm run build`, publish `dist`, Node 24). `www.dimoguitars.com` should be the primary domain in Netlify's Domain management; Netlify then redirects `dimoguitars.com` to it.

A build from scratch takes a few minutes because every photo is encoded to AVIF and WebP. Later builds reuse cached images when Netlify keeps its build cache.

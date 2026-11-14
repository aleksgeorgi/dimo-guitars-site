# Dimo Guitars site: context for Claude Code

## What this is
Brand and catalog site for **Dimo Guitars**: handmade electric guitars built by Dimo, a fine artist turned luthier, in his New York workshop. Aleks (his daughter) runs the business part-time and builds the site; Dimo builds the guitars.

- Live at **www.dimoguitars.com** (Netlify; domain registered at GoDaddy).
- Repo: `aleksgeorgi/dimo-guitars-site` on Aleks's **personal** GitHub. Keep it separate from any work accounts, tokens or tools.
- Pushing to `main` deploys to production.

## Current status (Nov 13, 2026)
- v1 is launched. Copy is still being refined.
- **The Reverb shop is not live yet.** `reverb_url` is blank for every guitar, so every available guitar shows "Join the mailing list" and "Ask Dimo a question" (which opens the footer contact form, a Netlify form). Don't build anything that assumes Reverb links exist.
- The first in-person sales event (a Philly guitar show) is done. Many visitors arrive on phones, so mobile Store and guitar pages, the contact form and the mailing list signup matter most.
- For anything risky, use a branch and a Netlify deploy preview rather than pushing straight to `main`.

## Sources of truth
- `../CURSOR_BRIEF.md` (workspace root, outside the repo): the full build spec. Read it before structural changes. Design wins on look; the brief wins on structure, data and behavior.
- `design/dimo-design.html` and `design/screens/*.png`: the visual design.
- `src/data/inventory.csv`: one row per guitar (46). `src/data/models.ts`: model codes D, M, R, RC, DH (names not final). `src/data/site.ts`: which pages are visible.
- `content/copy/DGPhilosophy.md`: About page copy. Render as written.
- Original photos live in `../Photos/` and are never committed. Run `npm run photos` to import resized copies.
- Cloud sessions (Claude Code on the web) only see the repo, not `../CURSOR_BRIEF.md` or `../Photos/`. Photo imports have to run on Aleks's computer.

## Non-negotiable rules
- **No em dash (U+2014) or en dash (U+2013)** anywhere in `src/` or `content/` (a build check enforces it). Aleks reads them as AI-written, so also avoid them in any copy you draft for her.
- **Location:** "NY, NY" in labels, "New York" in sentences. Never name a more specific town or region.
- **No invented facts** about Dimo, the guitars, woods, specs, years, awards or prices. Missing info shows "Coming soon". When a fact is needed, ask Aleks (Dimo is often with her and is the source of truth on construction and specs).
- **Tone:** refined, quiet, a single maker's workshop rooted in the violin-making tradition. Not a Fender/Gibson factory store. No hype, countdowns or "only X left" urgency.
- **No checkout on the site.** Sales go through Reverb. (Stripe exists only for in-person show sales and never touches the site.)
- **No monthly-fee services.** Static site on free tiers only (Netlify, EmailOctopus free plan, which allows one form per page, so the signup lives only in the footer).
- No React, CMS, backend, database or analytics in v1.

## Business decisions that shape the site
- The site is a catalog and brand home, not a sales funnel. Guitars will be released for sale gradually, so the `status` values (`available | sold | hold | not-for-sale`) matter and should be easy to change in the CSV.
- Contact email: `dimoguitarsnyc@gmail.com`. Business name everywhere: "Dimo Guitars".
- Policy pages still needed before Reverb launches: return/refund, shipping and insurance, terms of sale. They must match the Reverb shop's policies, which aren't written yet. Don't invent policy terms; scaffold pages with clear `TODO` placeholders if asked. `/privacy` exists and is marked `TODO: review`.

## Later (don't start unless Aleks asks)
- Footer social icons (Instagram, YouTube, Facebook) are live. URLs are set in `src/data/site.ts`; the icons are drawn in `src/components/Footer.astro`.
- Video: there's a lot of raw workshop footage. Planned: a background or promo video on the site, plus Shorts/Reels. If adding video, keep Lighthouse mobile performance at 90 or above (poster image, compressed self-hosted file or a lightweight YouTube embed, no autoplay with sound) and respect `prefers-reduced-motion`.
- Reverb sync at build time (pull price and status).
- Hidden pages to build out: Workshop & Tools, Jigs & Templates, Contact (possibly Pickups). The Guitars page is live; its model descriptions are still empty in `src/data/models.ts`.
- Model descriptions (currently "Description coming soon") and per-guitar specs in `inventory.csv`.

## Working with Aleks
- Strong in Python, SQL, APIs and system design; newer to Astro/Tailwind, so briefly explain framework-specific choices.
- This is a part-time passion project. Prefer small, finished, shippable changes over big refactors, and say when something is "good enough for now".

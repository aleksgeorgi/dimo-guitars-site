# Tonight: Scaffold Live on dimoguitars.com

Target: ~3–4 hours. **Done = site live with all 46 guitars + signup form working.** Polish is for another night.

## 0. Set up (10 min)
1. Look up who holds the domain: https://lookup.icann.org → `dimoguitars.com`. Note the **registrar** (Wix? GoDaddy? Squarespace?) and the **expiry date**. Make sure you can log in there.
2. Create the project folder: `~/Desktop/DimoGuitarsWebsite/site`
3. Copy into it: `CURSOR_BRIEF.md`, and `inventory.csv` → `site/src/data/inventory.csv` (Cursor will create the folders; you can also drop it in after Prompt 1).
4. Copy `TextCopy/DGPhilosophy.md` → `site/content/copy/DGPhilosophy.md`.
5. Open `site` in Cursor. Use Agent mode.

## 1. Cursor prompts (paste one at a time; check the result before the next)

**Prompt 1: Scaffold**
> Read CURSOR_BRIEF.md and follow it. Create the Astro project in this folder with Tailwind, Fontsource (Cormorant Garamond + Inter), and @astrojs/sitemap. Set up the CSS variables, base layout, header with nav (mobile menu), and footer exactly as specified. Create every route from section 3 with placeholder content so all pages render. Run the dev server and tell me the URL.

**Prompt 2: Photos + data**
> Implement section 4 (models.ts, CSV parsing from src/data/inventory.csv) and section 5: write scripts/import-photos.mjs using sharp, add `npm run photos`, then run it with the source folder ~/Desktop/DimoGuitarsWebsite/Photos/InventoryPhotos and copy the two DimoSignature logo PNGs from ~/Desktop/DimoGuitarsWebsite/Photos into src/assets/brand. Show me the photo report.

**Prompt 3: Store + guitar pages**
> Build /store, /store/[id], /guitars and /guitars/[model] per section 7: cards with hover crossfade, model filter chips, gallery + lightbox, CTA logic, details tables, SEO titles and OG images. Then build Home and About per section 7 (About renders content/copy/DGPhilosophy.md with the anchor ids).

**Prompt 4: Remaining pages + newsletter + deploy prep**
> Build Workshop, Jigs, Contact, Privacy and 404 per section 7, and the Newsletter component per section 8 (placeholder until I paste the EmailOctopus embed). Add netlify.toml and README per section 9. Run `npm run build`, fix any errors, then initialize git, commit, and give me the commands to push to a new GitHub repo named dimo-guitars-site.

Check in the browser at 375px (phone) and desktop width. Note issues; fix only what's broken tonight.

## 2. Mailing list: EmailOctopus (15 min)
1. Sign up (free, no card). Create a list: "Dimo Guitars Newsletter".
2. In settings, set the **sender name/email** and the **physical mailing address** (required by anti-spam law (CAN-SPAM) on every email; a PO box works if you'd rather not use the home address).
3. Forms → create an **Inline** form → "Add to your website" → copy the script.
4. Cursor: *"Paste this EmailOctopus embed into Newsletter.astro and style the form to match the site: [paste]"*
5. Test with your own email.

## 3. Hosting: Netlify (15 min)
1. Push the repo to GitHub (commands from Prompt 4).
2. Netlify → **Add new project → Import from GitHub** → pick the repo. Build `npm run build`, publish `dist` (netlify.toml should fill these in).
3. Deploy → you get `something.netlify.app`. Check it on your phone.

## 4. Domain: point dimoguitars.com at Netlify (15 min + waiting)
1. Netlify → Domain management → **Add domain** → `www.dimoguitars.com` (make **www** the primary; Netlify recommends this with external DNS). Also add `dimoguitars.com`.
2. At the registrar's DNS settings (don't change nameservers):
   | Type | Host | Value |
   |---|---|---|
   | A | `@` | `75.2.60.5` |
   | CNAME | `www` | `<your-site>.netlify.app` |
   - Delete any old A/CNAME records for `@`/`www` (e.g. old Wix ones) so they don't conflict.
   - **Don't touch MX records** if any exist (email).
   - If the domain is at **Wix**: Domains → ⋯ → **Manage DNS Records**. Wix domains can't change nameservers; editing records is the supported way.
3. Wait for DNS (minutes to a few hours). Netlify issues the HTTPS certificate automatically once DNS resolves. If it's not live by the time you stop, it'll be done by morning; nothing more to do.

## Stop here ✋
Specs, prices, Reverb links, real model names and photos for Workshop/Jigs come after the meeting with Dad. Those are just edits to `inventory.csv` / `models.ts` + a git push.

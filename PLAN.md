# Review: lichtconcept Astro website – improvement ideas

## Context
Asked for a review of the site's concept and a list of further improvements. The base is solid: a static Astro 7 site, all text in JSON, company data in one place, GDPR-friendly (no external resources), custom `check:site` / `check:content` scripts, responsive WebP images, `prefers-reduced-motion` respected, good docs (AGENT.md, README). The ideas below are ordered by impact. Each one is a separate, optional change. Implement only the ones the user picks.

---

## P1 – Real problems (fix before go-live)

1. **No mobile navigation without JS.** At ≤1280px `.top-bar nav` is `display:none`, and `.panel` opens only through the JS burger (`src/styles/site.css:45,209-214`, `src/scripts/site.ts`). That breaks the rule "readable without JS".
   Fix: build the burger as `<details><summary>` in `SiteHeader.astro`, or show the panel/nav when a `no-js` class is present. Add `aria-controls` to the burger.

2. **The slider auto-advances with no pause control** (WCAG 2.2.2). `site.ts` moves every 5s, and only prev/next exist.
   Fix: add a pause/play button (label in `site.json → labels`), and pause on `:hover`/`:focus-within`.

3. **The CI deploys without running the checks** (`.github/workflows/deploy.yml`). Add `npm run check`, `check:content` and `check:site` after the build, so a broken link or a missing h1 can't go live.

4. **Content keys are not validated.** AGENT.md itself flags this: `content.ts` uses `as never`/`as Site`.
   Fix: validate the JSON with zod (`astro/zod`) in `src/lib/content.ts`, either as one schema per file or by moving to Astro content collections with a `file()` loader. Missing or misspelled keys then fail the build. Keep the `interpolate()` step.

5. **Go-live guard for placeholders.** Add an opt-in mode to `check:site` (e.g. `CHECK_PRODUCTION=1`, enabled in CI once the content is final) that fails on "Platzhalter" in `dist/`.

6. **Privacy policy vs. hosting.** GitHub Pages (US, IP logging) is the current host. The Datenschutz text has to cover it, or the site moves to the self-hosted Nginx/Caddy setup the README already describes.

## P2 – SEO and sharing

7. **No `og:image` / `twitter:card`** in `LayoutBase.astro`. Add an optional `seo.image` (fallback: the area's poster/hero, generated via `getImage` at 1200×630) and `<meta name="twitter:card" content="summary_large_image">`.
8. **Richer JSON-LD** (`localBusinessJsonLd` in `src/config/company.ts`): add `logo`, `image`, `areaServed`, `vatID`, and the two areas as `department` with their own phone/email (data already in `company.ts`). Add `BreadcrumbList` on subpages and `Service` on the detail pages. Add opening hours or `geo` only if real data is provided.
9. **Icons:** add an `apple-touch-icon` PNG, `<meta name="theme-color">` (per area) and, optionally, a minimal `manifest.webmanifest`.

## P3 – Performance

10. **Background videos load even with reduced motion.** `<video autoplay>` is in the HTML, and the inline script removes it only afterwards (`src/pages/index.astro`), so the download may already have started.
    Fix: render the sources as `data-src` and attach them from JS only when `!reducedMotion` and not `navigator.connection?.saveData`.
11. **Flash of content before the scroll-in animation.** The `anim` class is set by the deferred module script, so elements paint, disappear, then fade in.
    Fix: set `anim` with a tiny inline script in `<head>` (with the reduced-motion check).
12. **Preload the main fonts** (`dm-sans-normal-300-700-latin.woff2`, `italiana-normal-400-latin.woff2`) in `LayoutBase.astro`.
13. **AVIF:** use `<Picture formats={['avif','webp']}>` for the hero and gallery images. Typically 20–40 % smaller than WebP.
14. **Faster page changes:** `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }` in `astro.config.mjs`. It is a one-line change with no runtime cost before interaction.
15. **Caching headers for self-hosting:** extend the README's Nginx/Caddy snippets with `Cache-Control: public, max-age=31536000, immutable` for `/_astro/` and `/fonts/`, plus security headers (CSP `default-src 'self'`, HSTS, `Referrer-Policy`, `X-Content-Type-Options`). The CSP is easy because there are no external resources.

## P4 – UX

16. **Lightbox** (`ReferenceGallery.astro`): add prev/next buttons, arrow keys, swipe and a counter; show the caption only if one exists. Labels go in `site.json → labels.gallery`.
17. **Subnav active state:** highlight the current section in `.subnav` with an IntersectionObserver (`aria-current="true"`), and on mobile make the subnav scroll horizontally with snap.
18. **Contact page:** add a vCard download per contact person (generated at build time from `company.ts`), and opening hours if real ones exist.
19. **Reference galleries:** optional filter/tags (e.g. Stadt / Gewerbe) through a `tags` field in `images.json`, once there are enough real pictures.

## P5 – Maintenance and tooling

20. **Automated a11y/HTML check:** add `html-validate` (or `pa11y-ci`/axe against `astro preview`) as `npm run check:a11y`. Lighthouse CI is optional.
21. **Dependabot/Renovate** for npm and GitHub Actions updates.
22. **One `npm run verify`** that chains `build && check && check:content && check:site`. AGENT.md would then need only one command.
23. **Editing for non-developers (optional, larger):** Keystatic or Decap CMS on top of the existing JSON files, so the graphics team can edit text without Git. Only worth it if text changes often.
24. **Tailwind is barely used** (reset + `sr-only` + one `motion-reduce:` class). Dropping it in favour of plain CSS would remove a dependency and a build step. This is low priority and a matter of taste.

---

## Critical files
- `src/components/SiteHeader.astro`, `src/styles/site.css`, `src/scripts/site.ts` (1, 2, 11, 17)
- `.github/workflows/deploy.yml`, `scripts/check-site.mjs`, `package.json` (3, 5, 20, 22)
- `src/lib/content.ts` (4)
- `src/layouts/LayoutBase.astro`, `src/config/company.ts` (7, 8, 9, 12)
- `src/pages/index.astro` (10), `src/components/ReferenceGallery.astro` (13, 16), `astro.config.mjs` (14), `README.md` (15)

All new visible text goes into `src/content/site.json` (rule 1 in AGENT.md). New identifiers are English, and comments are German.

## Verification (for whichever items are implemented)
- `npm run build && npm run check && npm run check:content && npm run check:site`
- Test the mobile menu with JS disabled at 375px width and at 1280px.
- Slider pause by keyboard; toggle reduced motion in DevTools and confirm in the Network tab that no video request is made.
- Lighthouse (mobile) before and after for performance, accessibility and SEO; check the OG preview with a local OG debugger (no external upload of unreleased content).

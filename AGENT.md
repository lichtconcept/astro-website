# AGENT.md

Guidance for coding agents working in this repository. [README.md](README.md) (German) is the guide for the people maintaining the site.

## Project

Static website of lichtconcept.GmbH with two business areas: Weihnachtsbeleuchtung, Christmas lighting (`/weihnachtsbeleuchtung/`), and Werbetechnik, sign making (`/werbetechnik/`). Astro 7, Tailwind CSS v4, TypeScript. No CMS, no database, no backend. The visible site is German only.

## Commands

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # output in dist/
npm run check            # astro check (TypeScript)
npm run check:content    # no hard-coded text in .astro files
npm run check:site       # checks dist/, so build first
npm run preview
```

Before reporting a change as done, run `build`, `check`, `check:content` and `check:site`. For visual changes, also look at the affected pages at desktop and phone width.

## Rules

### 1. Design and content are separated

- `.astro` files contain markup and logic only: **no text and no placeholders**. This includes alt texts, aria-labels, button and link labels, menu arrays, SEO titles and contact data.
- Text belongs in `src/content/*.json`. Company data belongs in `src/config/company.ts`.
- Additional content or config files are fine where they fit better.
- Client scripts contain no text either.
- Do not invent facts (figures, references, names). If real content is missing, ask, or leave the section out.

### 2. Language

| What | Language |
|---|---|
| Variables, functions, types, props, CSS classes and variables, data attributes | English |
| File and folder names, JSON keys, text placeholders | English |
| Code comments, README.md | German |
| Visible site content, build and check-script messages | German |
| URLs: file names in `src/pages/`, query parameters, anchor IDs | German |
| Business area names: `weihnachten`, `werbetechnik` | German |
| Media file names in `src/assets/` and `public/videos/` | German |

Do not copy a German identifier convention into new code, and do not translate public URLs.

The two business areas are the exception to the English rule: they are `weihnachten` and `werbetechnik` everywhere (type `Area`, `data-area`, JSON keys and files, asset folders, `company.ts`). Do not translate them. The same value is used in URLs (`/kontakt/?bereich=weihnachten`).

The package name `firmen-website` is still German.

### 3. Privacy (GDPR)

- No external resources at runtime: no CDN scripts, web fonts, embeds or tracking. Fonts are self-hosted in `public/fonts/`.
- The contact page deliberately has no form and no third-party form service.

### 4. Git and deployment

- **Every push to `main` deploys to GitHub Pages** (`.github/workflows/deploy.yml`). Push only when asked.
- The workflow runs `npm ci` and `npm run build` only. It runs none of the checks, so run them locally.
- Videos in `public/videos/` are stored with Git LFS. Without `git lfs pull` they are pointer files: the start page falls back to still images and `check:site` fails.

## Layout

```
src/pages/               routes (German file names = URLs), thin: load content, pick layout
src/layouts/             LayoutBase (head, SEO) → LayoutHome (start page), LayoutPage (all others)
src/components/          SiteHeader, Footer, SectionHero, SectionText, SectionGallery,
                         AreaHome, TextPage, ReferencePage, ReferenceGallery
src/content/site.json    navigation, footer, shared labels
src/content/pages/       home, weihnachten, werbetechnik, general (about, contact, 404)
src/content/legal.json   imprint, privacy
src/content/images.json  alt texts and captions, by folder and file name
src/lib/content.ts       only importer of the JSON files: types and placeholders
src/lib/images.ts        resolves image references
src/config/company.ts    company data, telHref(), LocalBusiness JSON-LD
src/scripts/site.ts      header, mobile menu, slider, scroll-in effects
src/styles/global.css    colour tokens per area, Tailwind theme
src/styles/site.css      all component styling
src/styles/fonts.css     @font-face rules
scripts/                 check-site.mjs, check-content.mjs
```

## Content

- Import content from `src/lib/content.ts`, never from the JSON files directly.
- Texts may use `{name}`, `{shortName}`, `{street}`, `{zip}`, `{city}`, `{phone}`, `{email}` and `{year}`. An unknown placeholder fails the build.
- Image references are `folder/file-name` without extension, for example `weihnachten/lichttor-ortseingang`.
- Every image used in a slider, card, section or gallery needs an entry in `images.json`; a missing file or entry fails the build. Decorative start-page posters need none.
- Galleries show all images of a folder, sorted by file name.

**Missing JSON keys are not detected.** `content.ts` uses type assertions (`as Site`, `as never`), so a removed or misspelled key passes `check`, `build` and `check:site` and renders as empty text. After editing JSON structure, compare it with the interfaces in `content.ts` and look at the page.

## Design

- The look is adapted from the MIT-licensed template [kavelle-astro](https://github.com/formgong-hq/kavelle-astro). Keep the credit in the README and the font licences in `public/fonts/`.
- Styling is plain CSS in `site.css`. Tailwind provides the base reset, the theme and a few utilities such as `sr-only`.
- Colours are CSS variables in `global.css`, switched by `data-area` on `<body>` or on a single element. Do not hard-code accent colours in components.
- Animations must respect `prefers-reduced-motion`. Content must stay readable without JavaScript.
- Check long German words (for example "Weihnachtsbeleuchtung") at phone width.
- The header switches to the burger menu at 1280 px and below.

## Constraints enforced by the checks

`check:site`:

- Internal links are absolute, end with `/`, and their targets and anchors exist.
- Each page has exactly one `<h1>`, a unique title and a unique description.
- Pages of one area show only that area's menu and link to no subpage of the other area. The switch link label contains `⇄`.
- The menu check matches the `navLabel` texts in `site.json`; change both together.

`check:content` only finds text between tags and in `alt`, `aria-label`, `title` and `placeholder` attributes. It does not see strings in frontmatter, `{…}` expressions, scripts or `.ts` files. Rule 1 applies there too.

## Common tasks

**Add a page**

1. Create `src/pages/…/<german-name>.astro` using `LayoutPage`.
2. Add its content to a JSON file, and extend the types and exports in `content.ts` if needed.
3. Link it in `site.json`.
4. Add the URL to `expected` in `scripts/check-site.mjs`.

**Add a section to an area start page:** add it to `landing.sections` and, if it should appear in the sub-menu, to `landing.subnav` with `href` equal to `#<id>`.

**Add a gallery image:** put the file in `src/assets/<area>/` and add its entry to `images.json`.

**Change the domain:** update `astro.config.mjs` (`site`), `public/robots.txt`, `public/CNAME` and the README.

## Open before go-live

Texts marked "Platzhalter", the placeholder images and videos, and the imprint and privacy policy still need real content. The company data in `company.ts` is real.

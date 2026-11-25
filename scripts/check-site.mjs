#!/usr/bin/env node
// =============================================================================
// Qualitäts-Check für die fertig gebaute Website in dist/
// Aufruf:  npm run check:site   (vorher: npm run build)
//
// Prüft:
//  1. Alle erwarteten Seiten + sitemap-index.xml + robots.txt existieren.
//  2. Alle internen Links (href, src, srcset, poster) zeigen auf vorhandene
//     Dateien – inklusive Sprungmarken (#anker) auf der Zielseite.
//  3. Keine externen Ressourcen (Skripte, Bilder, Stylesheets, Fonts von
//     fremden Servern) – wichtig für die DSGVO.
//  4. Jede Seite hat genau ein <h1>, einen eigenen <title> und eine eigene
//     Meta-Description.
//  5. Seiten unter /weihnachtsbeleuchtung/ zeigen nur das Weihnachts-Menü
//     (und umgekehrt), der Wechsel-Button führt in den anderen Bereich.
//  6. Videos sind echte Dateien und keine Git-LFS-Pointer.
// Keine Abhängigkeiten – nur Node.js.
// =============================================================================
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const errors = [];
const report = (page, text) => errors.push(`${page}: ${text}`);

if (!existsSync(DIST)) {
  console.error('dist/ fehlt – bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

// --- Alle HTML-Dateien einsammeln -------------------------------------------
function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

/** dist/werbetechnik/index.html → /werbetechnik/ */
function urlFromFile(file) {
  const rel = '/' + relative(DIST, file).split(sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

const pages = new Map(); // URL → HTML
for (const file of htmlFiles(DIST)) pages.set(urlFromFile(file), readFileSync(file, 'utf8'));

// --- 1. Erwartete Dateien -----------------------------------------------------
const expected = [
  '/',
  '/ueber-uns/',
  '/kontakt/',
  '/impressum/',
  '/datenschutz/',
  '/weihnachtsbeleuchtung/',
  '/weihnachtsbeleuchtung/staedte-kommunen/',
  '/weihnachtsbeleuchtung/gewerbe/',
  '/weihnachtsbeleuchtung/referenzen/',
  '/werbetechnik/',
  '/werbetechnik/lichtwerbung/',
  '/werbetechnik/fahrzeugbeschriftung/',
  '/werbetechnik/referenzen/',
];
for (const url of expected) if (!pages.has(url)) report(url, 'Seite fehlt in dist/');
for (const file of ['sitemap-index.xml', 'robots.txt', '404.html'])
  if (!existsSync(join(DIST, file))) report(file, 'Datei fehlt in dist/');

// Sitemap soll alle 13 Seiten enthalten
const sitemapFiles = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
const sitemapText = sitemapFiles.map((f) => readFileSync(join(DIST, f), 'utf8')).join('');
for (const url of expected)
  if (!new RegExp(`<loc>https?://[^<]+${url.replace(/[/.]/g, '\\$&')}</loc>`).test(sitemapText))
    report('sitemap', `${url} fehlt in der Sitemap`);

// --- Hilfsfunktionen -----------------------------------------------------------
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

/** Alle Link-/Ressourcen-Ziele einer Seite */
function linkTargets(html) {
  const list = [];
  for (const m of html.matchAll(/\s(href|src|poster)="([^"]*)"/g)) list.push(m[2]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g))
    for (const part of m[1].split(',')) list.push(part.trim().split(/\s+/)[0]);
  return list.filter(Boolean);
}

/** Datei in dist/ zu einem Pfad finden (/kontakt/ → kontakt/index.html) */
function fileForPath(path) {
  const decoded = decodeURIComponent(path);
  const candidate = decoded.endsWith('/') ? decoded + 'index.html' : decoded;
  const fullPath = join(DIST, candidate);
  return existsSync(fullPath) && statSync(fullPath).isFile() ? fullPath : null;
}

const hasId = (html, id) => new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html);

// --- 2.–4. Seiten einzeln prüfen ----------------------------------------------
const titles = new Map();
const descriptions = new Map();

for (const [url, rawHtml] of pages) {
  const html = stripComments(rawHtml);

  // 2. Interne Links
  for (const target of linkTargets(html)) {
    if (/^(mailto:|tel:|data:)/.test(target)) continue;
    if (/^(https?:)?\/\//.test(target)) continue; // externe Links werden unten gesondert geprüft
    const [withoutHash, hash] = target.split('#');
    const path = withoutHash.split('?')[0];

    if (path === '') {
      // reiner Anker auf derselben Seite, z. B. "#planung"
      if (hash && !hasId(html, hash)) report(url, `Anker "#${hash}" existiert nicht`);
      continue;
    }
    if (!path.startsWith('/')) {
      report(url, `relativer Link "${target}" – bitte absolute Pfade (/…/) verwenden`);
      continue;
    }
    const file = fileForPath(path);
    if (!file) {
      report(url, `Link-Ziel nicht gefunden: ${target}`);
      continue;
    }
    if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path))
      report(url, `Link ohne "/" am Ende: ${target}`);
    if (hash && file.endsWith('.html') && !hasId(readFileSync(file, 'utf8'), hash))
      report(url, `Anker "#${hash}" existiert nicht auf ${path}`);
  }

  // 3. Externe Ressourcen (zur Laufzeit geladene Dateien von fremden Servern)
  for (const m of html.matchAll(/<(script|img|source|video|audio|iframe)\b[^>]*\s(?:src|srcset|poster)="(https?:)?\/\/[^"]*"/g))
    report(url, `externe Ressource in <${m[1]}>`);
  for (const m of html.matchAll(/<link\b[^>]*>/g))
    if (/rel="(stylesheet|preload|preconnect|dns-prefetch|modulepreload)"/.test(m[0]) && /href="(https?:)?\/\//.test(m[0]))
      report(url, `externe Ressource: ${m[0]}`);
  if (/url\(\s*['"]?(https?:)?\/\//.test(html)) report(url, 'externe Ressource in CSS url()');

  // 4. Genau ein <h1>, Title und Description vorhanden und eindeutig
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) report(url, `${h1Count} <h1>-Überschriften (erwartet: genau 1)`);

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) report(url, '<title> fehlt');
  else if (titles.has(title)) report(url, `gleicher Title wie ${titles.get(title)}: "${title}"`);
  else titles.set(title, url);

  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!description) report(url, 'Meta-Description fehlt');
  else if (descriptions.has(description)) report(url, `gleiche Description wie ${descriptions.get(description)}`);
  else descriptions.set(description, url);
}

// --- 5. Bereichs-Menüs getrennt -------------------------------------------------
const areas = [
  { own: '/weihnachtsbeleuchtung/', other: '/werbetechnik/', menu: 'Navigation Weihnachtsbeleuchtung' },
  { own: '/werbetechnik/', other: '/weihnachtsbeleuchtung/', menu: 'Navigation Werbetechnik' },
];
for (const area of areas) {
  const otherArea = areas.find((x) => x !== area);
  for (const [url, rawHtml] of pages) {
    if (!url.startsWith(area.own)) continue;
    const html = stripComments(rawHtml);
    if (!html.includes(`aria-label="${area.menu}"`)) report(url, `eigenes Menü "${area.menu}" fehlt`);
    if (html.includes(`aria-label="${otherArea.menu}"`)) report(url, `fremdes Menü "${otherArea.menu}" gefunden`);
    // Unterseiten des anderen Bereichs dürfen nicht verlinkt sein, nur dessen Startseite
    for (const m of html.matchAll(/\shref="([^"#?]*)/g))
      if (m[1].startsWith(area.other) && m[1] !== area.other)
        report(url, `Link auf Unterseite des anderen Bereichs: ${m[1]}`);
    if (!new RegExp(`<a href="${area.other}"[^>]*>\\s*<span[^>]*>[^<]*⇄`).test(html))
      report(url, `Wechsel-Button nach ${area.other} fehlt`);
  }
}

// --- 6. Keine Git-LFS-Pointer statt echter Videos ---------------------------------
// (passiert, wenn das Projekt ohne git-lfs geklont wurde → vorher `git lfs pull`)
const videoDir = join(DIST, 'videos');
if (existsSync(videoDir))
  for (const name of readdirSync(videoDir)) {
    const path = join(videoDir, name);
    if (statSync(path).size < 1024 && readFileSync(path, 'utf8').startsWith('version https://git-lfs'))
      report(`videos/${name}`, 'ist nur ein Git-LFS-Pointer, kein Video – bitte "git lfs pull" ausführen und neu bauen');
  }

// --- Ergebnis ------------------------------------------------------------------
console.log(`Geprüft: ${pages.size} HTML-Seiten in dist/`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} Problem(e) gefunden:`);
  for (const f of errors) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ Alle Prüfungen bestanden.');

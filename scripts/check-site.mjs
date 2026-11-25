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
const fehler = [];
const fehlerMelden = (seite, text) => fehler.push(`${seite}: ${text}`);

if (!existsSync(DIST)) {
  console.error('dist/ fehlt – bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

// --- Alle HTML-Dateien einsammeln -------------------------------------------
function htmlDateien(ordner) {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return htmlDateien(pfad);
    return name.endsWith('.html') ? [pfad] : [];
  });
}

/** dist/werbetechnik/index.html → /werbetechnik/ */
function urlVonDatei(datei) {
  const rel = '/' + relative(DIST, datei).split(sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

const seiten = new Map(); // URL → HTML
for (const datei of htmlDateien(DIST)) seiten.set(urlVonDatei(datei), readFileSync(datei, 'utf8'));

// --- 1. Erwartete Dateien -----------------------------------------------------
const erwartet = [
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
for (const url of erwartet) if (!seiten.has(url)) fehlerMelden(url, 'Seite fehlt in dist/');
for (const datei of ['sitemap-index.xml', 'robots.txt', '404.html'])
  if (!existsSync(join(DIST, datei))) fehlerMelden(datei, 'Datei fehlt in dist/');

// Sitemap soll alle 13 Seiten enthalten
const sitemapDateien = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
const sitemapText = sitemapDateien.map((f) => readFileSync(join(DIST, f), 'utf8')).join('');
for (const url of erwartet)
  if (!new RegExp(`<loc>https?://[^<]+${url.replace(/[/.]/g, '\\$&')}</loc>`).test(sitemapText))
    fehlerMelden('sitemap', `${url} fehlt in der Sitemap`);

// --- Hilfsfunktionen -----------------------------------------------------------
const ohneKommentare = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

/** Alle Link-/Ressourcen-Ziele einer Seite */
function ziele(html) {
  const liste = [];
  for (const m of html.matchAll(/\s(href|src|poster)="([^"]*)"/g)) liste.push(m[2]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g))
    for (const teil of m[1].split(',')) liste.push(teil.trim().split(/\s+/)[0]);
  return liste.filter(Boolean);
}

/** Datei in dist/ zu einem Pfad finden (/kontakt/ → kontakt/index.html) */
function dateiZuPfad(pfad) {
  const dekodiert = decodeURIComponent(pfad);
  const kandidat = dekodiert.endsWith('/') ? dekodiert + 'index.html' : dekodiert;
  const voll = join(DIST, kandidat);
  return existsSync(voll) && statSync(voll).isFile() ? voll : null;
}

const hatId = (html, id) => new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html);

// --- 2.–4. Seiten einzeln prüfen ----------------------------------------------
const titel = new Map();
const beschreibungen = new Map();

for (const [url, rohHtml] of seiten) {
  const html = ohneKommentare(rohHtml);

  // 2. Interne Links
  for (const ziel of ziele(html)) {
    if (/^(mailto:|tel:|data:)/.test(ziel)) continue;
    if (/^(https?:)?\/\//.test(ziel)) continue; // externe Links werden unten gesondert geprüft
    const [ohneHash, hash] = ziel.split('#');
    const pfad = ohneHash.split('?')[0];

    if (pfad === '') {
      // reiner Anker auf derselben Seite, z. B. "#planung"
      if (hash && !hatId(html, hash)) fehlerMelden(url, `Anker "#${hash}" existiert nicht`);
      continue;
    }
    if (!pfad.startsWith('/')) {
      fehlerMelden(url, `relativer Link "${ziel}" – bitte absolute Pfade (/…/) verwenden`);
      continue;
    }
    const datei = dateiZuPfad(pfad);
    if (!datei) {
      fehlerMelden(url, `Link-Ziel nicht gefunden: ${ziel}`);
      continue;
    }
    if (!pfad.endsWith('/') && !/\.[a-z0-9]+$/i.test(pfad))
      fehlerMelden(url, `Link ohne "/" am Ende: ${ziel}`);
    if (hash && datei.endsWith('.html') && !hatId(readFileSync(datei, 'utf8'), hash))
      fehlerMelden(url, `Anker "#${hash}" existiert nicht auf ${pfad}`);
  }

  // 3. Externe Ressourcen (zur Laufzeit geladene Dateien von fremden Servern)
  for (const m of html.matchAll(/<(script|img|source|video|audio|iframe)\b[^>]*\s(?:src|srcset|poster)="(https?:)?\/\/[^"]*"/g))
    fehlerMelden(url, `externe Ressource in <${m[1]}>`);
  for (const m of html.matchAll(/<link\b[^>]*>/g))
    if (/rel="(stylesheet|preload|preconnect|dns-prefetch|modulepreload)"/.test(m[0]) && /href="(https?:)?\/\//.test(m[0]))
      fehlerMelden(url, `externe Ressource: ${m[0]}`);
  if (/url\(\s*['"]?(https?:)?\/\//.test(html)) fehlerMelden(url, 'externe Ressource in CSS url()');

  // 4. Genau ein <h1>, Title und Description vorhanden und eindeutig
  const h1Anzahl = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Anzahl !== 1) fehlerMelden(url, `${h1Anzahl} <h1>-Überschriften (erwartet: genau 1)`);

  const t = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!t) fehlerMelden(url, '<title> fehlt');
  else if (titel.has(t)) fehlerMelden(url, `gleicher Title wie ${titel.get(t)}: "${t}"`);
  else titel.set(t, url);

  const d = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!d) fehlerMelden(url, 'Meta-Description fehlt');
  else if (beschreibungen.has(d)) fehlerMelden(url, `gleiche Description wie ${beschreibungen.get(d)}`);
  else beschreibungen.set(d, url);
}

// --- 5. Bereichs-Menüs getrennt -------------------------------------------------
const bereiche = [
  { eigen: '/weihnachtsbeleuchtung/', fremd: '/werbetechnik/', menue: 'Navigation Weihnachtsbeleuchtung' },
  { eigen: '/werbetechnik/', fremd: '/weihnachtsbeleuchtung/', menue: 'Navigation Werbetechnik' },
];
for (const b of bereiche) {
  const anderes = bereiche.find((x) => x !== b);
  for (const [url, rohHtml] of seiten) {
    if (!url.startsWith(b.eigen)) continue;
    const html = ohneKommentare(rohHtml);
    if (!html.includes(`aria-label="${b.menue}"`)) fehlerMelden(url, `eigenes Menü "${b.menue}" fehlt`);
    if (html.includes(`aria-label="${anderes.menue}"`)) fehlerMelden(url, `fremdes Menü "${anderes.menue}" gefunden`);
    // Unterseiten des anderen Bereichs dürfen nicht verlinkt sein, nur dessen Startseite
    for (const m of html.matchAll(/\shref="([^"#?]*)/g))
      if (m[1].startsWith(b.fremd) && m[1] !== b.fremd)
        fehlerMelden(url, `Link auf Unterseite des anderen Bereichs: ${m[1]}`);
    if (!new RegExp(`<a href="${b.fremd}"[^>]*>\\s*<span[^>]*>[^<]*⇄`).test(html))
      fehlerMelden(url, `Wechsel-Button nach ${b.fremd} fehlt`);
  }
}

// --- 6. Keine Git-LFS-Pointer statt echter Videos ---------------------------------
// (passiert, wenn das Projekt ohne git-lfs geklont wurde → vorher `git lfs pull`)
const videoOrdner = join(DIST, 'videos');
if (existsSync(videoOrdner))
  for (const name of readdirSync(videoOrdner)) {
    const pfad = join(videoOrdner, name);
    if (statSync(pfad).size < 1024 && readFileSync(pfad, 'utf8').startsWith('version https://git-lfs'))
      fehlerMelden(`videos/${name}`, 'ist nur ein Git-LFS-Pointer, kein Video – bitte "git lfs pull" ausführen und neu bauen');
  }

// --- Ergebnis ------------------------------------------------------------------
console.log(`Geprüft: ${seiten.size} HTML-Seiten in dist/`);
if (fehler.length) {
  console.error(`\n✗ ${fehler.length} Problem(e) gefunden:`);
  for (const f of fehler) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ Alle Prüfungen bestanden.');

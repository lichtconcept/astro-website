#!/usr/bin/env node
// =============================================================================
// Prüft die Trennung von Design und Inhalt:
// In src/**/*.astro dürfen keine fest eingetippten Texte stehen (auch keine
// Platzhalter) – weder zwischen Tags noch in alt/aria-label/title/placeholder.
// Alle Texte gehören in src/content/*.json (Firmendaten: src/config/firma.ts).
// Aufruf:  npm run check:content
// =============================================================================
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');
const fehler = [];

function dateien(ordner) {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return name.endsWith('.astro') ? [pfad] : [];
  });
}

/** Entfernt {…}-Ausdrücke (mit verschachtelten Klammern) */
function ohneAusdruecke(text) {
  let tiefe = 0;
  let aus = '';
  for (const zeichen of text) {
    if (zeichen === '{') tiefe++;
    else if (zeichen === '}') tiefe = Math.max(0, tiefe - 1);
    else if (tiefe === 0) aus += zeichen;
  }
  return aus;
}

for (const datei of dateien(SRC)) {
  let text = readFileSync(datei, 'utf8');
  text = text.replace(/^---[\s\S]*?\n---/, ''); // Frontmatter (Code)
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '');
  const name = relative(process.cwd(), datei);

  // Texte in Attributen, die Leser sehen oder vorgelesen bekommen
  for (const m of text.matchAll(/\s(alt|aria-label|title|placeholder)="([^"]*[A-Za-zÄÖÜäöüß][^"]*)"/g))
    fehler.push(`${name}: fester Text im Attribut ${m[1]}="${m[2]}"`);

  // Texte zwischen Tags
  const ohne = ohneAusdruecke(text);
  for (const m of ohne.matchAll(/>([^<>]*)</g)) {
    const inhalt = m[1].trim();
    if (/[A-Za-zÄÖÜäöüß]/.test(inhalt)) fehler.push(`${name}: fester Text "${inhalt.replace(/\s+/g, ' ')}"`);
  }
}

if (fehler.length) {
  console.error(`✗ ${fehler.length} feste Texte in .astro-Dateien gefunden (bitte nach src/content/ verschieben):`);
  for (const f of fehler) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ Keine festen Texte in .astro-Dateien.');

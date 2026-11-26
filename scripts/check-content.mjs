#!/usr/bin/env node
// =============================================================================
// Prüft die Trennung von Design und Inhalt:
// In src/**/*.astro dürfen keine fest eingetippten Texte stehen (auch keine
// Platzhalter) – weder zwischen Tags noch in alt/aria-label/title/placeholder.
// Alle Texte gehören in src/content/*.json (Firmendaten: src/config/company.ts).
// Aufruf:  npm run check:content
// =============================================================================
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');
const errors = [];

function astroFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return astroFiles(path);
    return name.endsWith('.astro') ? [path] : [];
  });
}

/** Entfernt {…}-Ausdrücke (mit verschachtelten Klammern) */
function stripExpressions(text) {
  let depth = 0;
  let result = '';
  for (const char of text) {
    if (char === '{') depth++;
    else if (char === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) result += char;
  }
  return result;
}

for (const file of astroFiles(SRC)) {
  let text = readFileSync(file, 'utf8');
  text = text.replace(/^---[\s\S]*?\n---/, ''); // Frontmatter (Code)
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '');
  const name = relative(process.cwd(), file);

  // Texte in Attributen, die Leser sehen oder vorgelesen bekommen
  for (const m of text.matchAll(/\s(alt|aria-label|aria-roledescription|title|placeholder)="([^"]*[A-Za-zÄÖÜäöüß][^"]*)"/g))
    errors.push(`${name}: fester Text im Attribut ${m[1]}="${m[2]}"`);

  // Texte zwischen Tags
  const markup = stripExpressions(text);
  for (const m of markup.matchAll(/>([^<>]*)</g)) {
    const content = m[1].trim();
    if (/[A-Za-zÄÖÜäöüß]/.test(content)) errors.push(`${name}: fester Text "${content.replace(/\s+/g, ' ')}"`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} feste Texte in .astro-Dateien gefunden (bitte nach src/content/ verschieben):`);
  for (const f of errors) console.error('  - ' + f);
  process.exit(1);
}
console.log('✓ Keine festen Texte in .astro-Dateien.');

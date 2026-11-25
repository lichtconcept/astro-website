// =============================================================================
// Bild-Helfer: löst Bildverweise aus den Content-Dateien auf.
// Verweis = Pfad unter src/assets/ ohne Endung, z. B. "weihnachten/lichttor-ortseingang".
// Alt-Texte und Bildunterschriften stehen in src/content/bilder.json
// (Schlüssel: Ordner → Dateiname ohne Endung).
// Fehlt eine Datei oder ein Alt-Text, bricht der Build mit einer klaren Meldung ab.
// =============================================================================
import type { ImageMetadata } from 'astro';
import { bilderTexte, type BildInfo } from './content';

const alle = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true });

function dateien(ordner: string) {
  return Object.entries(alle)
    .filter(([pfad]) => pfad.startsWith(`/src/assets/${ordner}/`))
    .sort(([a], [b]) => a.localeCompare(b, 'de'));
}

const name = (pfad: string) => pfad.split('/').pop()!.replace(/\.[^.]+$/, '');

/** Bildverweis wie "weihnachten/lichttor-ortseingang" → Bild + Texte */
export function bild(verweis: string): { src: ImageMetadata } & BildInfo {
  const [ordner, datei] = verweis.split('/');
  const treffer = dateien(ordner).find(([pfad]) => name(pfad) === datei);
  if (!treffer) throw new Error(`Bild "${verweis}" nicht gefunden (Verweis in src/content/, Datei in src/assets/)`);
  const info = bilderTexte[ordner]?.[datei];
  if (!info) throw new Error(`Kein Eintrag für "${verweis}" in src/content/bilder.json`);
  return { src: treffer[1].default, ...info };
}

/** Alle Bilder eines Ordners, alphabetisch – Alt-Text/Unterschrift aus bilder.json */
export function ordnerBilder(ordner: string): { src: ImageMetadata; alt: string; caption?: string }[] {
  return dateien(ordner).map(([pfad, modul]) => {
    const n = name(pfad);
    const info = bilderTexte[ordner]?.[n];
    if (!info) throw new Error(`Kein Eintrag für "${ordner}/${n}" in src/content/bilder.json`);
    return { src: modul.default, ...info };
  });
}

/** Bild ohne Texte (z. B. Poster der Startseite, dekorativ) – Verweis wie bei bild() */
export function bildDatei(verweis: string): ImageMetadata {
  const [ordner, datei] = verweis.split('/');
  const treffer = dateien(ordner).find(([pfad]) => name(pfad) === datei);
  if (!treffer) throw new Error(`Bild "${verweis}" nicht gefunden (Verweis in src/content/, Datei in src/assets/)`);
  return treffer[1].default;
}

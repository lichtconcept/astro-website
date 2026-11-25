// =============================================================================
// Bild-Helfer: löst Bildverweise aus den Content-Dateien auf.
// Verweis = Pfad unter src/assets/ ohne Endung, z. B. "weihnachten/lichttor-ortseingang".
// Alt-Texte und Bildunterschriften stehen in src/content/images.json
// (Schlüssel: Ordner → Dateiname ohne Endung).
// Fehlt eine Datei oder ein Alt-Text, bricht der Build mit einer klaren Meldung ab.
// =============================================================================
import type { ImageMetadata } from 'astro';
import { imageTexts, type ImageInfo } from './content';

const allImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true });

export type ImageEntry = { src: ImageMetadata } & ImageInfo;

function filesIn(folder: string) {
  return Object.entries(allImages)
    .filter(([path]) => path.startsWith(`/src/assets/${folder}/`))
    .sort(([a], [b]) => a.localeCompare(b, 'de'));
}

const baseName = (path: string) => path.split('/').pop()!.replace(/\.[^.]+$/, '');

function textsFor(folder: string, name: string): ImageInfo {
  const info = imageTexts[folder]?.[name];
  if (!info) throw new Error(`Kein Eintrag für "${folder}/${name}" in src/content/images.json`);
  return info;
}

/** Bild ohne Texte (z. B. Poster der Startseite, dekorativ) */
export function imageFile(ref: string): ImageMetadata {
  const [folder, name] = ref.split('/');
  const match = filesIn(folder).find(([path]) => baseName(path) === name);
  if (!match) throw new Error(`Bild "${ref}" nicht gefunden (Verweis in src/content/, Datei in src/assets/)`);
  return match[1].default;
}

/** Bildverweis wie "weihnachten/lichttor-ortseingang" → Bild + Texte */
export function findImage(ref: string): ImageEntry {
  const [folder, name] = ref.split('/');
  return { src: imageFile(ref), ...textsFor(folder, name) };
}

/** Alle Bilder eines Ordners, alphabetisch – Alt-Text/Unterschrift aus images.json */
export function folderImages(folder: string): ImageEntry[] {
  return filesIn(folder).map(([path, module]) => ({ src: module.default, ...textsFor(folder, baseName(path)) }));
}

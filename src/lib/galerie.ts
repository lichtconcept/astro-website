// =============================================================================
// Hilfsfunktion für Bildergalerien.
// Wandelt alle Bilder eines Ordners (per import.meta.glob eingesammelt) in eine
// Liste für <ReferenzGalerie /> um.
//
// Alt-Text: wird aus dem Dateinamen erzeugt, z. B.
//   "marktplatz-weihnachtsbaum.jpg"  →  "Marktplatz Weihnachtsbaum"
// Darum Dateinamen sprechend wählen (Kleinbuchstaben, Wörter mit "-" trennen).
// Für bessere Texte kann pro Datei ein eigener Alt-Text / eine Bildunterschrift
// angegeben werden (siehe "texte" in den referenzen.astro-Seiten).
// =============================================================================
import type { ImageMetadata } from 'astro';
import type { GalerieBild } from '../components/ReferenzGalerie.astro';

export type BildTexte = Record<string, { alt?: string; caption?: string }>;

/** Dateiname ohne Pfad und Endung, z. B. "marktplatz-weihnachtsbaum" */
function dateiname(pfad: string): string {
  return pfad.split('/').pop()!.replace(/\.[^.]+$/, '');
}

/** "marktplatz-weihnachtsbaum" → "Marktplatz Weihnachtsbaum" */
function altAusDateiname(name: string): string {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((wort) => wort.charAt(0).toUpperCase() + wort.slice(1))
    .join(' ');
}

export function galerieAusOrdner(
  dateien: Record<string, { default: ImageMetadata }>,
  texte: BildTexte = {},
): GalerieBild[] {
  return Object.entries(dateien)
    .sort(([a], [b]) => a.localeCompare(b, 'de'))
    .map(([pfad, modul]) => {
      const name = dateiname(pfad);
      return {
        src: modul.default,
        alt: texte[name]?.alt ?? altAusDateiname(name),
        caption: texte[name]?.caption,
      };
    });
}

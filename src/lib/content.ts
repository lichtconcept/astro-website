// =============================================================================
// Content-Loader – der EINZIGE Ort, der die JSON-Dateien aus src/content/ lädt.
//
// Seiten und Komponenten enthalten keine Texte, sondern lesen sie von hier.
// - Platzhalter wie {name}, {ort}, {telefon} in den JSON-Texten werden mit den
//   Firmendaten aus src/config/firma.ts gefüllt (eine Quelle für Firmendaten).
// - Die Typen unten sorgen dafür, dass `npm run check` fehlende Felder meldet.
// =============================================================================
import { firma } from '../config/firma';
import siteJson from '../content/site.json';
import bilderJson from '../content/bilder.json';
import startJson from '../content/pages/start.json';
import weihnachtenJson from '../content/pages/weihnachten.json';
import werbetechnikJson from '../content/pages/werbetechnik.json';
import allgemeinJson from '../content/pages/allgemein.json';
import legalJson from '../content/legal.json';

// --- Typen ---------------------------------------------------------------------
export interface Link { label: string; href: string }
export interface ActionLink extends Link { style?: string }
export interface Seo { title: string; description: string }

export interface NavigationBereich {
  name: string;
  badge: string;
  home: string;
  homeLabel: string;
  navLabel: string;
  navLabelMore: string;
  navLabelMobile: string;
  menu: Link[];
  cta?: Link;
  switch?: Link;
}

export interface Site {
  lang: string;
  locale: string;
  labels: {
    more: string;
    menu: string;
    previousSlide: string;
    nextSlide: string;
    sectionsNav: string;
    gallery: { dialog: string; close: string };
  };
  navigation: Record<'weihnachten' | 'werbetechnik' | 'neutral', NavigationBereich>;
  startFooter: { label: string; links: Link[] };
  footer: {
    about: string;
    areasHeading: string;
    areasLabel: string;
    areas: Link[];
    infoHeading: string;
    infoLabel: string;
    info: Link[];
    contactHeading: string;
    phonePrefix: string;
    copyright: string;
  };
}

export interface Start {
  seo: Seo;
  heading: string;
  halves: {
    area: 'weihnachten' | 'werbetechnik';
    href: string;
    eyebrow: string;
    title: string;
    text: string;
    button: string;
    poster: string;
    video: string;
  }[];
}

export interface Card { title: string; text: string; href: string; image: string }
export interface Abschnitt {
  id: string;
  heading: string;
  text: string;
  list?: string[];
  link?: Link;
  image?: string;
  cards?: Card[];
}
export interface Landing {
  seo: Seo;
  hero: { heading: string; button: Link; slides: { image: string; title: string }[] };
  subnav: Link[];
  intro: { eyebrow: string; title: string; text: string; button: Link };
  sections: Abschnitt[];
  gallery: { id: string; heading: string; folder: string; count: number; link: Link };
}

/** Textseite: Detailseiten, Über uns, Impressum, Datenschutz, 404 */
export interface Textseite {
  seo: Seo;
  title: string;
  lead?: string;
  sections?: {
    heading: string;
    paragraphs?: string[];
    lines?: string[];
    list?: string[];
    linkList?: { label: string; href: string; text: string }[];
  }[];
  actions?: ActionLink[];
}

export interface Referenzseite {
  seo: Seo;
  title: string;
  lead: string;
  folder: string;
  action: Link;
}

export interface Kontakt {
  seo: Seo;
  title: string;
  lead: string;
  labels: { area: string; person: string; phone: string; email: string; write: string; general: string; phoneShort: string };
  blocks: { id: 'weihnachten' | 'werbetechnik'; subject: string }[];
}

export type BildInfo = { alt: string; caption?: string };

// --- Firmendaten in Texte einsetzen ----------------------------------------------
const werte: Record<string, string> = {
  name: firma.name,
  kurzname: firma.kurzname,
  strasse: firma.adresse.strasse,
  plz: firma.adresse.plz,
  ort: firma.adresse.ort,
  telefon: firma.telefon,
  email: firma.email,
  jahr: String(new Date().getFullYear()),
};

function fuelle<T>(wert: T): T {
  if (typeof wert === 'string') {
    return wert.replace(/\{(\w+)\}/g, (treffer, schluessel: string) => {
      if (!(schluessel in werte)) throw new Error(`Unbekannter Platzhalter ${treffer} in src/content/`);
      return werte[schluessel];
    }) as T;
  }
  if (Array.isArray(wert)) return wert.map(fuelle) as T;
  if (wert && typeof wert === 'object')
    return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, fuelle(v)])) as T;
  return wert;
}

// --- Exporte ----------------------------------------------------------------------
export const site: Site = fuelle(siteJson as Site);
export const start: Start = fuelle(startJson as Start);
export const weihnachten: {
  landing: Landing;
  staedte: Textseite;
  gewerbe: Textseite;
  referenzen: Referenzseite;
} = fuelle(weihnachtenJson as never);
export const werbetechnik: {
  landing: Landing;
  lichtwerbung: Textseite;
  fahrzeuge: Textseite;
  referenzen: Referenzseite;
} = fuelle(werbetechnikJson as never);
export const allgemein: { ueberUns: Textseite; kontakt: Kontakt; notFound: Textseite } = fuelle(allgemeinJson as never);
export const legal: { impressum: Textseite; datenschutz: Textseite } = fuelle(legalJson as never);
export const bilderTexte: Record<string, Record<string, BildInfo>> = bilderJson;

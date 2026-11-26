// =============================================================================
// Content-Loader – der EINZIGE Ort, der die JSON-Dateien aus src/content/ lädt.
//
// Seiten und Komponenten enthalten keine Texte, sondern lesen sie von hier.
// - Platzhalter wie {name}, {city}, {phone} in den JSON-Texten werden mit den
//   Firmendaten aus src/config/company.ts gefüllt (eine Quelle für Firmendaten).
// - Die Typen unten sorgen dafür, dass `npm run check` fehlende Felder meldet.
// =============================================================================
import { company, type SocialNetwork, type Weekday } from '../config/company';
import siteJson from '../content/site.json';
import imagesJson from '../content/images.json';
import homeJson from '../content/pages/home.json';
import weihnachtenJson from '../content/pages/weihnachten.json';
import werbetechnikJson from '../content/pages/werbetechnik.json';
import generalJson from '../content/pages/general.json';
import legalJson from '../content/legal.json';

// --- Typen ---------------------------------------------------------------------
/** Die beiden Bereiche: Weihnachtsbeleuchtung und Werbetechnik */
export type Area = 'weihnachten' | 'werbetechnik';

export interface Link { label: string; href: string }
export interface ActionLink extends Link { style?: string }
export interface Seo { title: string; description: string }

export interface NavigationArea {
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
    carousel: string;
    slide: string;
    previousSlide: string;
    nextSlide: string;
    sectionsNav: string;
    gallery: { dialog: string; close: string };
    openingHours: { heading: string; timeSuffix: string; days: Record<Weekday, string> };
  };
  navigation: Record<Area | 'neutral', NavigationArea>;
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
    socialLabel: string;
    socialNames: Record<SocialNetwork, string>;
    copyright: string;
  };
}

export interface Home {
  seo: Seo;
  heading: string;
  halves: {
    area: Area;
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
export interface Section {
  id: string;
  heading: string;
  text: string;
  list?: string[];
  link?: Link;
  image?: string;
  cards?: Card[];
}
/** Heller Abschluss mit Laufschrift; "heading" ist die Überschrift für Screenreader */
export interface Outro {
  heading: string;
  lines: string[];
  text: string;
  button: Link;
}
export interface Landing {
  seo: Seo;
  hero: { heading: string; button: Link; slides: { image: string; title: string }[] };
  subnav: Link[];
  intro: { eyebrow: string; title: string; text: string; button: Link };
  sections: Section[];
  gallery: { id: string; heading: string; folder: string; count: number; link: Link };
  outro?: Outro;
}

/** Textseite: Detailseiten, Über uns, Impressum, Datenschutz, 404 */
export interface TextPageContent {
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

/** Porträt auf "Über uns" */
export interface Portrait {
  image: string;
  heading: string;
  paragraphs: string[];
  signName: string;
  signRole: string;
  button?: Link;
}

/** Zahlenband auf "Über uns" */
export interface Stats {
  label: string;
  items: { value: string; label: string }[];
}

export interface AboutPageContent extends TextPageContent {
  portrait?: Portrait;
  stats?: Stats;
}

export interface ReferencePageContent {
  seo: Seo;
  title: string;
  lead: string;
  folder: string;
  action: Link;
}

export interface Contact {
  seo: Seo;
  title: string;
  lead: string;
  labels: { area: string; person: string; phone: string; email: string; write: string; general: string; phoneShort: string };
  /** area ist zugleich der Wert in der URL, z. B. /kontakt/?bereich=weihnachten */
  blocks: { area: Area; subject: string }[];
}

/** label steht in der Referenz-Reihe der Bereichs-Startseiten auf dem Bild */
export type ImageInfo = { alt: string; label?: string; caption?: string };

// --- Firmendaten in Texte einsetzen ----------------------------------------------
const values: Record<string, string> = {
  name: company.name,
  shortName: company.shortName,
  street: company.address.street,
  zip: company.address.zip,
  city: company.address.city,
  phone: company.phone,
  email: company.email,
  managingDirector: company.managingDirector,
  registerCourt: company.register.court,
  registerNumber: company.register.number,
  vatId: company.vatId,
  year: String(new Date().getFullYear()),
};

function interpolate<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, key: string) => {
      if (!(key in values)) throw new Error(`Unbekannter Platzhalter ${match} in src/content/`);
      return values[key];
    }) as T;
  }
  if (Array.isArray(value)) return value.map(interpolate) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolate(v)])) as T;
  return value;
}

// --- Exporte ----------------------------------------------------------------------
export const site: Site = interpolate(siteJson as Site);
export const home: Home = interpolate(homeJson as Home);
export const weihnachten: {
  landing: Landing;
  municipalities: TextPageContent;
  business: TextPageContent;
  references: ReferencePageContent;
} = interpolate(weihnachtenJson as never);
export const werbetechnik: {
  landing: Landing;
  illuminatedSigns: TextPageContent;
  vehicles: TextPageContent;
  references: ReferencePageContent;
} = interpolate(werbetechnikJson as never);
export const general: { about: AboutPageContent; contact: Contact; notFound: TextPageContent } = interpolate(generalJson as never);
export const legal: { imprint: TextPageContent; privacy: TextPageContent } = interpolate(legalJson as never);
export const imageTexts: Record<string, Record<string, ImageInfo>> = imagesJson;

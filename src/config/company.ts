// =============================================================================
// FIRMENDATEN – zentrale Stelle für Name, Adresse, Telefon und E-Mail.
// Wird verwendet in: Footer, Kontaktseite, Logo, strukturierten Daten (JSON-LD)
// und in den Texten aus src/content/ (Platzhalter wie {name} oder {city}).
// =============================================================================

export type SocialNetwork = 'instagram' | 'pinterest' | 'whatsapp';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type Weekday = (typeof weekdays)[number];

/** Alle Tage von "from" bis "to", auch über das Wochenende hinweg (z. B. Samstag – Montag) */
function daysBetween(from: Weekday, to: Weekday): Weekday[] {
  const start = weekdays.indexOf(from);
  const count = ((weekdays.indexOf(to) - start + 7) % 7) + 1;
  return Array.from({ length: count }, (_, i) => weekdays[(start + i) % 7]);
}

/** Ein Zeitfenster, z. B. { from: 'Monday', to: 'Friday', opens: '08:00', closes: '17:00' } */
export interface OpeningPeriod {
  from: Weekday;
  /** weglassen, wenn das Zeitfenster nur für einen Tag gilt */
  to?: Weekday;
  opens: string;
  closes: string;
}

export const company = {
  name: 'lichtconcept.GmbH',
  shortName: 'lichtconcept',

  address: {
    street: 'Am Entenfeld 10',
    zip: '83236',
    city: 'Übersee',
    country: 'DE',
  },

  phone: '+49 8642 595209-0',
  email: 'mail@lichtconcept.net',

  // Geschäftsführung (Impressum)
  managingDirector: 'Peter Poremba',

  // Registereintrag und Umsatzsteuer (Impressum)
  register: {
    court: 'Traunstein',
    number: 'HRB 18524',
  },
  vatId: 'DE 261 176 673',

  // Öffnungszeiten (Footer, Kontaktseite, strukturierte Daten); leer = nicht anzeigen.
  // Bei einer Mittagspause zwei Einträge für dieselben Tage anlegen.
  openingHours: [
    { from: 'Monday', to: 'Thursday', opens: '08:00', closes: '12:00' },
    { from: 'Monday', to: 'Thursday', opens: '13:00', closes: '17:00' },
    { from: 'Friday', opens: '08:00', closes: '13:00' },
  ] as OpeningPeriod[],

  // Profile in sozialen Netzwerken (Symbole im Footer). Vollständige Adresse mit
  // https:// eintragen, WhatsApp als https://wa.me/49…; leer = kein Symbol.
  // Wer hier etwas einträgt, muss es in der Datenschutzerklärung erwähnen.
  social: {
    instagram: '',
    pinterest: '',
    whatsapp: '',
  } as Record<SocialNetwork, string>,

  // Ansprechpartner je Bereich (Kontaktseite)
  weihnachten: {
    contactPerson: 'Elke Kroner & Anna Neuhauser',
    phone: '+49 8642 595209-0',
    email: 'mail@lichtconcept.net',
  },
  werbetechnik: {
    contactPerson: 'Joachim Schlund',
    phone: '+49 8642 595209-5',
    email: 'werbetechnik@lichtconcept.net',
  },
} as const;

/** Telefonnummer für tel:-Links (ohne Leerzeichen und Bindestriche). */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

/** JSON-LD "LocalBusiness" für Suchmaschinen (Startseite + Über uns). */
export function localBusinessJsonLd(site: URL | undefined, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    url: site?.href,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.zip,
      addressLocality: company.address.city,
      addressCountry: company.address.country,
    },
    description,
    // fehlt in der Ausgabe, solange keine Öffnungszeiten eingetragen sind
    openingHoursSpecification: company.openingHours.length
      ? company.openingHours.map(({ from, to = from, opens, closes }) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: daysBetween(from, to),
          opens,
          closes,
        }))
      : undefined,
  };
}

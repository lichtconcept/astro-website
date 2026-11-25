// =============================================================================
// FIRMENDATEN – zentrale Stelle für Name, Adresse, Telefon und E-Mail.
// Wird verwendet in: Footer, Kontaktseite, Logo, strukturierten Daten (JSON-LD).
//
// ALLE WERTE SIND PLATZHALTER und müssen durch die echten Daten ersetzt werden.
// =============================================================================

export const firma = {
  name: 'Musterfirma GmbH',
  kurzname: 'Musterfirma',

  adresse: {
    strasse: 'Musterstraße 1',
    plz: '12345',
    ort: 'Musterstadt',
    land: 'DE',
  },

  telefon: '+49 123 456789-0',
  email: 'info@ihre-firma.de',

  // Ansprechpartner je Bereich (Kontaktseite)
  weihnachten: {
    titel: 'Weihnachtsbeleuchtung',
    ansprechpartner: 'Max Mustermann',
    telefon: '+49 123 456789-10',
    email: 'weihnachten@ihre-firma.de',
  },
  werbetechnik: {
    titel: 'Werbetechnik',
    ansprechpartner: 'Erika Musterfrau',
    telefon: '+49 123 456789-20',
    email: 'werbetechnik@ihre-firma.de',
  },
} as const;

/** Telefonnummer für tel:-Links (ohne Leerzeichen und Bindestriche). */
export function telLink(nummer: string): string {
  return 'tel:' + nummer.replace(/[^\d+]/g, '');
}

/** JSON-LD "LocalBusiness" für Suchmaschinen (Startseite + Über uns). */
export function localBusinessJsonLd(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: firma.name,
    url: site?.href,
    telephone: firma.telefon,
    email: firma.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: firma.adresse.strasse,
      postalCode: firma.adresse.plz,
      addressLocality: firma.adresse.ort,
      addressCountry: firma.adresse.land,
    },
    description:
      'Professionelle Weihnachtsbeleuchtung für Städte, Kommunen und Gewerbe sowie Werbetechnik: Lichtwerbung, Fahrzeugbeschriftung und Beschilderung.',
  };
}

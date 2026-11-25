// =============================================================================
// FIRMENDATEN – zentrale Stelle für Name, Adresse, Telefon und E-Mail.
// Wird verwendet in: Footer, Kontaktseite, Logo, strukturierten Daten (JSON-LD).
//
// ALLE WERTE SIND PLATZHALTER und müssen durch die echten Daten ersetzt werden.
// =============================================================================

export const firma = {
  name: 'Lichtconcept GmbH',
  kurzname: 'Lichtconcept',

  adresse: {
    strasse: 'Am Entenfeld 10',
    plz: '83236',
    ort: 'Übersee',
    land: 'DE',
  },

  telefon: '+49 8642 595209-0',
  email: 'mail@lichtconcept.net',

  // Ansprechpartner je Bereich (Kontaktseite)
  weihnachten: {
    titel: 'Weihnachtsbeleuchtung',
    ansprechpartner: 'Elke Kroner und Anna Neuhauser',
    telefon: '+49 8642 595209-0',
    email: 'mail@lichtconcept.net',
  },
  werbetechnik: {
    titel: 'Werbetechnik',
    ansprechpartner: 'Joachim Schlund',
    telefon: '+49 8642 595209-5',
    email: 'werbetechnik@lichtconcept.net',
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

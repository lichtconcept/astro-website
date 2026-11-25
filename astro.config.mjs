// @ts-check
// =============================================================================
// Astro-Konfiguration
// Doku: https://docs.astro.build/en/reference/configuration-reference/
// =============================================================================
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // ---------------------------------------------------------------------------
  // PLATZHALTER: Hier die echte Domain eintragen (mit https://, ohne Pfad).
  // Wird für Canonical-URLs, Open-Graph-Tags und die Sitemap verwendet.
  // Die gleiche Domain muss auch in public/robots.txt angepasst werden.
  // ---------------------------------------------------------------------------
  site: 'https://astro.lichtconcept.net',

  // Rein statische Website: `npm run build` erzeugt fertige HTML-Dateien in dist/.
  output: 'static',

  // Alle URLs enden mit "/" (z. B. /kontakt/). Jede Seite wird als
  // <ordner>/index.html gebaut – passt ohne Zusatz-Konfiguration zu Nginx/Caddy.
  trailingSlash: 'always',

  vite: {
    // Tailwind CSS v4 (Konfiguration erfolgt in src/styles/global.css)
    plugins: [tailwindcss()],
  },

  // Erzeugt beim Build automatisch sitemap-index.xml + sitemap-0.xml.
  // Die 404-Seite gehört nicht in die Sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});

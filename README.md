# Firmen-Website – Weihnachtsbeleuchtung & Werbetechnik

Rein statische Website, gebaut mit [Astro](https://docs.astro.build) und Tailwind CSS.
Kein CMS, keine Datenbank: Texte und Bilder liegen direkt in den Dateien. `npm run build` erzeugt den fertigen Ordner `dist/`, der auf den Webserver kopiert wird.

---

## Für die Grafik: Wo ändere ich was?

> Änderungen ansehen: `npm run dev` starten und <http://localhost:4321> öffnen – die Seite aktualisiert sich beim Speichern automatisch.

| Was                                  | Wo                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Texte einer Seite**                | `src/content/pages/*.json` (`home` = Startseite, `christmas` = Weihnachtsbeleuchtung, `signage` = Werbetechnik, `general` = Über uns, Kontakt, 404) und `src/content/legal.json` (Impressum, Datenschutz). **In den `.astro`-Dateien steht kein Text.** |
| **Seitentitel & Google-Beschreibung**| in der JSON-Datei der Seite: Block `seo` (`title`, `description`; jede Seite braucht eigene Werte) |
| **Firmenname, Adresse, Telefon, E-Mail** | `src/config/company.ts`. In den JSON-Texten stehen dafür Platzhalter wie `{name}`, `{city}`, `{phone}`, `{email}` |
| **Farben**                           | `src/styles/global.css`, Abschnitt 1 – je Bereich Hintergrund- und Akzentfarben             |
| **Menüpunkte, Buttons im Header**    | `src/content/site.json` → `navigation` (je Bereich `christmas`, `signage`, `neutral`) |
| **Sprungmenü auf den Hauptseiten**   | `subnav` in `src/content/pages/christmas.json` bzw. `signage.json` (`href` = `id` des Abschnitts) |
| **Links im Footer**                  | `src/content/site.json` → `footer` und `startFooter` (Mini-Footer der Startseite)           |
| **Texte der Startseite (Split-Screen)** | `src/content/pages/home.json` → `halves`                                               |
| **Logo / Favicon**                   | `public/favicon.svg` (wird auch als Logo im Header verwendet)                             |

### Bilder

- **Referenz-Galerien:** Bild einfach in `src/assets/christmas/` (Weihnachtsbeleuchtung) bzw. `src/assets/signage/` (Werbetechnik) legen (`.jpg`, `.png`, `.webp`). Es erscheint dann automatisch in der Galerie und in der Vorschau auf der Bereichs-Hauptseite.
  - Dateinamen sprechend wählen, z. B. `marktplatz-musterstadt.jpg`.
  - **Pflicht:** in `src/content/images.json` einen Eintrag mit Alt-Text ergänzen (Schlüssel: Ordner → Dateiname ohne Endung). Fehlt er, bricht der Build mit einer Meldung ab.
  - Reihenfolge = alphabetisch nach Dateiname (bei Bedarf `01-…`, `02-…` voranstellen).
  - Optionale Bildunterschrift: ebenfalls in `images.json` (`caption`).
- **Standbilder der Startseite:** `src/assets/home/weihnachten-poster.jpg` und `werbetechnik-poster.jpg` ersetzen (gleicher Dateiname).
- Bilder in guter Qualität ablegen (ca. 2000 px Breite genügt) – Astro verkleinert und komprimiert sie beim Build automatisch.

### Videos (Startseite)

Dateien in `public/videos/` ablegen, genau mit diesen Namen:

```
weihnachten-loop.webm   weihnachten-loop.mp4
werbetechnik-loop.webm  werbetechnik-loop.mp4
```

Die vorhandenen Dateien sind **Platzhalter-Videos** (8 s, langsame Kamerafahrt über das Standbild) – einfach durch echte Videos mit gleichem Namen ersetzen. Fehlen die Dateien, zeigt die Startseite automatisch nur das Standbild. Empfehlung: kurze Schleife (10–20 s), ohne Ton, 1280×720 oder 1920×1080, max. ca. 3–5 MB pro Datei. Bei „Bewegung reduzieren“ (Betriebssystem-Einstellung) wird kein Video geladen.

Videos umwandeln mit [ffmpeg](https://ffmpeg.org) (`quelle.mov` = Originalvideo):

```bash
ffmpeg -i quelle.mov -an -vf scale=1280:-2 -c:v libvpx-vp9 -b:v 0 -crf 38 weihnachten-loop.webm
ffmpeg -i quelle.mov -an -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p weihnachten-loop.mp4
```

### Welche Datei ist welche Seite?

| URL                                         | Datei                                              |
| ------------------------------------------- | -------------------------------------------------- |
| `/`                                         | `src/pages/index.astro`                            |
| `/weihnachtsbeleuchtung/`                   | `src/pages/weihnachtsbeleuchtung/index.astro`      |
| `/weihnachtsbeleuchtung/staedte-kommunen/`  | `src/pages/weihnachtsbeleuchtung/staedte-kommunen.astro` |
| `/weihnachtsbeleuchtung/gewerbe/`           | `src/pages/weihnachtsbeleuchtung/gewerbe.astro`    |
| `/weihnachtsbeleuchtung/referenzen/`        | `src/pages/weihnachtsbeleuchtung/referenzen.astro` |
| `/werbetechnik/`                            | `src/pages/werbetechnik/index.astro`               |
| `/werbetechnik/lichtwerbung/`               | `src/pages/werbetechnik/lichtwerbung.astro`        |
| `/werbetechnik/fahrzeugbeschriftung/`       | `src/pages/werbetechnik/fahrzeugbeschriftung.astro`|
| `/werbetechnik/referenzen/`                 | `src/pages/werbetechnik/referenzen.astro`          |
| `/ueber-uns/`, `/kontakt/`, `/impressum/`, `/datenschutz/` | `src/pages/<name>.astro`            |

**Benennung:** Bezeichner im Code (Dateien in `src/` außerhalb von `pages/`, Variablen, JSON-Schlüssel) sind englisch; Kommentare, README und sichtbare Texte deutsch. Dateinamen in `src/pages/` sind deutsch, weil sie die URLs bestimmen. In URLs heißen die Bereiche weiter `weihnachten`/`werbetechnik` (`/kontakt/?bereich=weihnachten`), im Code `christmas`/`signage`.

**Regeln:** Jede Seite hat genau eine `<h1>`-Überschrift. Interne Links immer mit `/` am Ende schreiben (`/kontakt/`, nicht `/kontakt`). Bitte keine Schriften, Skripte oder Bilder von fremden Servern einbinden (Datenschutz).

---

## Für die IT: Entwicklung, Build, Deployment

Voraussetzung: Node.js ≥ 22.

```bash
npm install          # einmalig: Abhängigkeiten installieren
npm run dev          # Entwicklungsserver auf http://localhost:4321
npm run build        # fertige Website nach dist/ bauen
npm run check:site   # prüft dist/: Links, Anker, <h1>, Titles, Menü-Trennung, externe Ressourcen
npm run check        # TypeScript-/Astro-Prüfung
npm run check:content # prüft: keine festen Texte in .astro-Dateien
npm run preview      # dist/ lokal ansehen
```

### Videos mit Git LFS

Die Videos in `public/videos/` (`*.mp4`, `*.webm`) werden über [Git LFS](https://git-lfs.com) versioniert (Regel in `.gitattributes`), damit das Repository klein bleibt.

```bash
# einmalig pro Rechner
sudo pacman -S git-lfs        # bzw. apt install git-lfs / brew install git-lfs
git lfs install

# nach dem Klonen bzw. wenn Videos fehlen
git lfs pull
git lfs ls-files              # zeigt die Dateien, die in LFS liegen
```

Neue oder ersetzte Videos ganz normal mit `git add` / `git commit` / `git push` einchecken – LFS greift automatisch.

> **Wichtig:** Wurde ohne git-lfs geklont, liegen in `public/videos/` nur kleine Textdateien („Pointer“). Die Startseite zeigt dann nur die Standbilder, und `npm run check:site` meldet einen Fehler – vor dem Deployment `git lfs pull` ausführen.

### Deployment

```bash
npm run build && npm run check:site
rsync -av --delete dist/ user@server:/var/www/astro.lichtconcept.net/
```

Jede Seite liegt als `<pfad>/index.html` vor, die 404-Seite als `404.html`.

**Nginx**

```nginx
root /var/www/astro.lichtconcept.net;
location / { try_files $uri $uri/ =404; }
error_page 404 /404.html;
```

**Caddy**

```caddy
astro.lichtconcept.net {
    root * /var/www/astro.lichtconcept.net
    file_server
    handle_errors {
        rewrite * /404.html
        file_server
    }
}
```

### Vor dem Livegang ersetzen

- Domain in `astro.config.mjs` (`site`) **und** `public/robots.txt`
- Firmendaten in `src/config/company.ts`
- Impressum und Datenschutzerklärung (rechtlich geprüfte Texte)
- Platzhalterbilder in `src/assets/…`, Logo `public/favicon.svg`, Videos in `public/videos/`
- Alle Texte mit „Platzhalter“ (`grep -rn Platzhalter src/`)

### Aufbau

```
src/config/company.ts      Firmendaten (zentral)
src/styles/global.css      Farben, Schrift (Tailwind v4)
src/styles/site.css        Aussehen (Design im Stil des Templates „kavelle“)
src/layouts/LayoutBase     <html>/<head>, SEO-Tags – Basis aller Layouts
src/layouts/LayoutHome     Startseite (ohne Header)
src/layouts/LayoutPage     alle Seiten mit Header/Footer (Bereich steuert die Farben)
src/components/            SiteHeader, Footer, SectionHero (Slider), SectionText, SectionGallery,
                           AreaHome, TextPage, ReferencePage, ReferenceGallery
src/content/               ALLE Texte als JSON (site, pages/*, legal, images)
src/lib/content.ts         lädt und typisiert die JSON-Dateien, setzt Firmendaten ein
src/lib/images.ts          löst Bildverweise aus den JSON-Dateien auf (src/assets/)
src/scripts/site.ts        Verhalten: Header, Slider, Einblenden beim Scrollen
scripts/check-content.mjs  prüft: keine festen Texte in .astro-Dateien (npm run check:content)
scripts/check-site.mjs     automatischer Qualitäts-Check für dist/
```

JavaScript im Browser (`src/scripts/site.ts` plus drei kleine Skripte): Header beim Scrollen, Slider, Einblenden beim Scrollen, Großansicht der Galerie, Hervorhebung auf der Kontaktseite, Abschalten der Videos bei „Bewegung reduzieren“. Alle Inhalte sind auch ohne JavaScript lesbar.

### Design-Vorlage
Das Aussehen (Schriften, Slider, Header, Karten) ist vom MIT-lizenzierten Astro-Template [kavelle](https://github.com/formgong-hq/kavelle-astro) (© 2026 Formgong) übernommen und angepasst. Die Schriften DM Sans und Italiana (SIL OFL 1.1) liegen selbst gehostet in `public/fonts/`, die Lizenztexte daneben.

# Aufgabe: Astro-Grundgerüst für Firmen-Website (Weihnachtsbeleuchtung + Werbetechnik)

## Kontext
Eine Firma mit zwei getrennten Geschäftsbereichen – **professionelle Weihnachtsbeleuchtung** und **Werbetechnik** – bekommt eine gemeinsame, rein statische Website (kein CMS, keine Datenbank, kein Server-Side-Rendering). Kunden bleiben in der Regel in einem Bereich. Ziele: gutes SEO (eine Domain, Unterverzeichnisse), wenig Klicken und Scrollen, schnelle Ladezeiten.

Die Seite wird später als fertiger `dist/`-Ordner auf einen eigenen Server (Nginx/Caddy) kopiert. Gepflegt wird sie von einer Grafikerin (HTML/CSS-Kenntnisse, WordPress-Erfahrung) und einem IT-Informatiker. Code muss deshalb einfach, gut lesbar und kommentiert sein.

## Deine Aufgabe
Lege das Astro-Projekt an, erzeuge die unten beschriebene Ordner- und Dateistruktur und verschalte Layouts, Komponenten und Seiten so, dass `npm run build` eine vollständige, durchklickbare statische Website erzeugt. Inhalte sind Platzhalter – Struktur, Navigation und Verlinkung müssen vollständig funktionieren.

## Technische Vorgaben
- Astro (aktuelle stabile Version), `output: 'static'`.
- Setup:
  ```bash
  npm create astro@latest   # leeres/minimales Template, TypeScript "strict"
  npx astro add tailwind sitemap
  ```
- Prüfe, welche Tailwind-Version installiert wurde, und verwende nur Klassen, die in dieser Version existieren (z. B. Gradient-Klassen unterscheiden sich zwischen v3 und v4).
- `astro.config.mjs`: `site: 'https://ihre-firma.de'` (Platzhalter, klar kommentiert), `trailingSlash: 'always'`, Sitemap-Integration aktiv.
- Keine externen Ressourcen zur Laufzeit (keine Google Fonts, keine CDNs) – DSGVO. Schriften ggf. lokal einbinden oder System-Fonts nutzen.
- Kein clientseitiges JavaScript-Framework. JS nur, wo unvermeidbar, und dann minimal.
- Bilder aus `src/assets/` über `astro:assets` (`<Image />` bzw. `getImage()` für Hintergrundbilder) einbinden, damit Astro sie optimiert. Videos liegen unter `public/videos/`.
- Keine Scroll-/Einflug-Animationen. Dezente Hover-Effekte sind ok.

## Ordner- und Dateistruktur (exakt so anlegen)
```text
mein-projekt/
├── public/
│   ├── favicon.svg
│   └── videos/                      # .gitkeep; später weihnachten-loop.(webm|mp4), werbetechnik-loop.(webm|mp4)
├── src/
│   ├── assets/
│   │   ├── weihnachten/             # Platzhalterbild(er) für Bereich 1
│   │   └── werbetechnik/            # Platzhalterbild(er) für Bereich 2
│   ├── components/
│   │   ├── HeaderWeihnachten.astro  # Menü NUR für Weihnachtsbeleuchtung + Wechsel-Button
│   │   ├── HeaderWerbung.astro      # Menü NUR für Werbetechnik + Wechsel-Button
│   │   ├── Footer.astro             # Gemeinsamer Footer
│   │   └── ReferenzGalerie.astro    # Bildergalerie-Baustein
│   ├── layouts/
│   │   ├── LayoutBase.astro         # <html>, <head>, SEO-Meta, gemeinsam für alle Layouts
│   │   ├── LayoutWeiche.astro       # Minimal-Layout für die Split-Screen-Startseite
│   │   ├── LayoutWeihnachten.astro  # HeaderWeihnachten + Footer, Farbschema Gold/Dunkelblau
│   │   └── LayoutWerbung.astro      # HeaderWerbung + Footer, Farbschema Blau/Anthrazit
│   └── pages/
│       ├── index.astro              # 50/50 Split-Screen-Weiche
│       ├── ueber-uns.astro
│       ├── kontakt.astro
│       ├── impressum.astro
│       ├── datenschutz.astro
│       ├── weihnachtsbeleuchtung/
│       │   ├── index.astro          # Hauptseite mit Anker-Navigation
│       │   ├── staedte-kommunen.astro
│       │   ├── gewerbe.astro
│       │   └── referenzen.astro
│       └── werbetechnik/
│           ├── index.astro          # Hauptseite mit Anker-Navigation
│           ├── lichtwerbung.astro
│           ├── fahrzeugbeschriftung.astro
│           └── referenzen.astro
└── astro.config.mjs
```
`LayoutBase.astro` ist die einzige Ergänzung zur ursprünglichen Struktur: Sie vermeidet doppelten `<head>`-Code in den drei Layouts.

## Verschaltung im Detail

### LayoutBase.astro
- Props: `title`, `description`, optional `bereich` (`'weihnachten' | 'werbetechnik' | undefined`).
- Setzt `<html lang="de">`, Charset, Viewport, `<title>`, Meta-Description, Canonical-URL (aus `Astro.url` + `site`), Favicon, Open-Graph-Basis-Tags.
- Setzt `data-bereich` am `<body>`, damit Akzentfarben per CSS-Variablen umgeschaltet werden können.
- Akzentfarben zentral als CSS-Variablen definieren (eine Stelle, leicht für die Grafikerin änderbar):
  - Weihnachten: Gold/Amber-Akzent auf Dunkelblau
  - Werbetechnik: Sky-Blau-Akzent auf Anthrazit/Slate

### LayoutWeiche.astro
- Nutzt LayoutBase ohne Bereichs-Header; nur Slot + Mini-Footer.

### LayoutWeihnachten.astro / LayoutWerbung.astro
- Nutzen LayoutBase mit passendem `bereich`, binden den jeweiligen Header, `<main><slot /></main>` und `Footer.astro` ein.
- Jede Seite im jeweiligen Ordner nutzt ausschließlich ihr Bereichs-Layout.
- Gemeinsame Seiten (`ueber-uns`, `kontakt`, `impressum`, `datenschutz`) nutzen ein neutrales Layout (LayoutBase + einfacher neutraler Header mit Logo und Links zu beiden Bereichen + Footer). Lege dafür bei Bedarf `LayoutNeutral.astro` an.

### index.astro – Split-Screen-Weiche
- Volle Bildschirmhöhe ohne Scrollen: Desktop 50/50 links/rechts, Mobil oben/unten.
- Jede Hälfte ist komplett ein Link (`<a>`) auf `/weihnachtsbeleuchtung/` bzw. `/werbetechnik/`.
- Je Hälfte: Hintergrund (Video mit Poster-Bild als Fallback, siehe unten), dunkler Verlauf für Lesbarkeit, kurze Dachzeile, Überschrift, ein Satz Nutzen, Button „Bereich entdecken →“.
- Überschriften-Hierarchie: genau ein `<h1>` auf der Seite (z. B. visuell verstecktes `<h1>` mit Firmenname + Bereiche, die Bereichstitel als `<h2>`).
- Logo-Pille fixiert oben mittig, Mini-Footer fixiert unten mit Links: Über uns, Kontakt, Impressum, Datenschutz.
- Video-Element: `autoplay loop muted playsinline preload="metadata"`, `poster` gesetzt, Quellen WebM vor MP4. Bei `prefers-reduced-motion: reduce` kein Video, nur Poster-Bild. Fehlen die Videodateien, muss die Seite trotzdem sauber mit dem Poster-Bild funktionieren.

### HeaderWeihnachten.astro / HeaderWerbung.astro
- Sticky Header in Bereichsfarbe, Logo + Bereichs-Badge (Link auf Bereichs-Startseite).
- Navigation zeigt NUR die Seiten des eigenen Bereichs:
  - Weihnachten: Übersicht, Städte & Kommunen, Gewerbe, Referenzen, Button „Anfrage stellen“
  - Werbetechnik: Übersicht, Lichtwerbung, Fahrzeuge, Referenzen, Button „Projekt anfragen“
- Rechts ein dezenter Wechsel-Button: „Zur Werbetechnik ⇄“ bzw. „Zur Weihnachtsbeleuchtung ⇄“.
- Aktive Seite markieren (`aria-current="page"` anhand `Astro.url.pathname`).
- Mobile Navigation ohne JS-Framework (z. B. `<details>`/`<summary>`); der Wechsel-Button muss auch mobil sichtbar sein.
- Menüpunkte als Array am Anfang der Komponente definieren, damit sie leicht editierbar sind.

### Kontakt-Links mit Bereichsvorauswahl
- Die Anfrage-Buttons verlinken auf `/kontakt/?bereich=weihnachten` bzw. `/kontakt/?bereich=werbetechnik`.
- `kontakt.astro`: zwei Kontaktblöcke (je Bereich) mit Platzhalter-Telefon und `mailto:`-Link mit vorausgefülltem Betreff. Ein kleines Inline-Skript hebt anhand des Query-Parameters den passenden Block hervor. Kein Formular-Backend; an der Stelle einen kommentierten Platzhalter für ein späteres Formular lassen.

### Bereichs-Hauptseiten (`weihnachtsbeleuchtung/index.astro`, `werbetechnik/index.astro`)
- Kompakte Hauptseite: alle wichtigsten Leistungen untereinander als Abschnitte mit `id`.
- Darunter/oberhalb ein sticky Sub-Menü mit Anker-Links (Weihnachten z. B.: Planung | Montage | Wartung | Referenzen; Werbetechnik: Lichtwerbung | Fahrzeuge | Beschilderung | Referenzen).
- `scroll-margin-top` setzen, damit Abschnitte nicht unter dem Sticky-Header verschwinden.
- Jeder Abschnitt verlinkt – wo vorhanden – auf die zugehörige Detailseite.

### Unterseiten
- Je Seite: eigener `title` und `description`, ein `<h1>`, Platzhaltertext, Call-to-Action zum Kontakt (mit Bereichsparameter).
- `referenzen.astro` in beiden Bereichen nutzt `ReferenzGalerie.astro`.

### ReferenzGalerie.astro
- Props: Liste von Bildern (importierte Assets) mit Alt-Text und optionaler Bildunterschrift.
- Responsives Raster, Bilder über `<Image />` mit sinnvollen `widths`/`sizes`, `loading="lazy"`.
- Großansicht per Klick ohne Bibliothek (z. B. natives `<dialog>` mit minimalem Skript). Ohne JS führt der Klick auf das Originalbild.
- Bildliste pro Bereich so ablegen, dass die Grafikerin nur Dateien in `src/assets/<bereich>/` legen und einen Eintrag ergänzen muss (oder per `import.meta.glob` automatisch alle Bilder des Ordners einsammeln – bevorzugt).

### Footer.astro
- Firmenname, Platzhalter-Adresse/Telefon, Links: Über uns, Kontakt, Impressum, Datenschutz, beide Bereichs-Startseiten.

### SEO
- Sitemap über `@astrojs/sitemap`.
- `public/robots.txt` mit Verweis auf die Sitemap (Domain als Platzhalter).
- Strukturierte Daten: ein JSON-LD `LocalBusiness` (Platzhalterwerte) auf der Startseite und auf „Über uns“.

## Was du NICHT tun sollst
- Kein CMS, kein SSR-Adapter, keine Datenbank, kein Formular-Backend.
- Keine zusätzlichen Seiten außer den genannten (außer ggf. `LayoutNeutral.astro` und einer `404.astro`).
- Keine schwergewichtigen Abhängigkeiten (Slider, Animations-Bibliotheken, UI-Frameworks).

## Abnahmekriterien
1. `npm run build` läuft fehlerfrei durch, `npm run dev` startet.
2. `dist/` enthält alle 13 Seiten als `…/index.html` unter den erwarteten URLs, plus `sitemap-index.xml` und `robots.txt`.
3. Alle internen Links funktionieren (prüfe automatisiert, z. B. mit einem kleinen Skript über alle `href` in `dist/`, oder mit einem Link-Checker als devDependency).
4. Seiten unter `/weihnachtsbeleuchtung/` zeigen nur das Weihnachts-Menü, Seiten unter `/werbetechnik/` nur das Werbetechnik-Menü; der Wechsel-Button führt jeweils in den anderen Bereich.
5. Die Startseite ist auf Desktop (1920×1080) und Mobil (390×844) ohne Scrollen vollständig sichtbar.
6. Jede Seite hat genau ein `<h1>`, einen eigenen Title und eine eigene Meta-Description.
7. Eine kurze `README.md` erklärt für die Grafikerin: wo Texte, Bilder, Videos, Farben und Menüpunkte geändert werden, und für den Informatiker: Build und Deployment (`npm run build`, anschließend `rsync -av --delete dist/ user@server:/var/www/ihre-firma/`).

Fasse am Ende zusammen, welche Dateien angelegt wurden und welche Platzhalter noch ersetzt werden müssen.

// =============================================================================
// Verhalten der Seite (aus dem Template "kavelle" portiert, MIT-Lizenz).
// Jeder Block ist optional: gibt es das Element auf der Seite nicht, passiert nichts.
// Enthält KEINE Texte – alle Beschriftungen kommen aus src/content/.
// =============================================================================
const wurzel = document.documentElement;
const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
const alle = <T extends Element>(selektor: string, ort: ParentNode = document) =>
  Array.from(ort.querySelectorAll<T>(selektor));

if (!ruhig) wurzel.classList.add('anim');

// Kopfzeile: nach dem ersten Scrollen dunkel; Handy-Menü
const leiste = document.querySelector<HTMLElement>('[data-top-bar]');
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
if (leiste) {
  const beimScrollen = () => leiste.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', beimScrollen, { passive: true });
  beimScrollen();
  const umschalten = (offen: boolean) => {
    leiste.classList.toggle('open', offen);
    burger?.setAttribute('aria-expanded', String(offen));
  };
  burger?.addEventListener('click', () => umschalten(!leiste.classList.contains('open')));
  alle<HTMLAnchorElement>('[data-panel] a').forEach((a) => a.addEventListener('click', () => umschalten(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && umschalten(false));
}

// Slider: Überblendung alle 5 s, die Buchstaben des Titels steigen nacheinander auf
const folien = alle<HTMLElement>('[data-slide]');
if (folien.length) {
  const balken = alle<HTMLElement>('[data-bars] i');
  const zaehler = document.querySelector('[data-cur]');
  const DAUER = 5000;
  let aktuell = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  folien.forEach((folie) => {
    const titel = folie.querySelector('h2');
    if (!titel) return;
    const text = titel.textContent ?? '';
    titel.setAttribute('aria-label', text);
    titel.textContent = '';
    let nr = 0;
    // Wortweise aufteilen, damit Wörter nie mitten im Wort umbrechen
    text.split(' ').forEach((wort, w) => {
      if (w > 0) titel.appendChild(document.createTextNode(' '));
      const huelle = document.createElement('span');
      huelle.className = 'w';
      huelle.setAttribute('aria-hidden', 'true');
      [...wort].forEach((zeichen) => {
        const buchstabe = document.createElement('span');
        buchstabe.className = 'l';
        buchstabe.textContent = zeichen;
        buchstabe.style.setProperty('--i', String(nr++));
        huelle.appendChild(buchstabe);
      });
      titel.appendChild(huelle);
    });
  });

  const zeige = (n: number) => {
    aktuell = (n + folien.length) % folien.length;
    folien.forEach((folie, i) => {
      folie.classList.toggle('on', i === aktuell);
      folie.setAttribute('aria-hidden', String(i !== aktuell));
      const knopf = folie.querySelector<HTMLElement>('.btn');
      if (knopf) knopf.tabIndex = i === aktuell ? 0 : -1;
    });
    balken.forEach((b, i) => (b.className = i < aktuell ? 'done' : ''));
    if (zaehler) zaehler.textContent = String(aktuell + 1).padStart(2, '0');
    if (!ruhig && balken[aktuell]) {
      void balken[aktuell].offsetWidth; // Animation neu starten
      balken[aktuell].style.setProperty('--dur', DAUER + 'ms');
      balken[aktuell].className = 'run';
    }
    clearTimeout(timer);
    if (!ruhig) timer = setTimeout(() => zeige(aktuell + 1), DAUER);
  };

  document.querySelector('[data-prev]')?.addEventListener('click', () => zeige(aktuell - 1));
  document.querySelector('[data-next]')?.addEventListener('click', () => zeige(aktuell + 1));
  document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : zeige(aktuell)));
  zeige(0);
}

// Einblenden beim Scrollen
const einblenden = alle<HTMLElement>('[data-in]');
if (!ruhig && 'IntersectionObserver' in window) {
  const beobachter = new IntersectionObserver(
    (eintraege) =>
      eintraege.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        beobachter.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  einblenden.forEach((el) => beobachter.observe(el));
} else {
  einblenden.forEach((el) => el.classList.add('in'));
}

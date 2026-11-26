// =============================================================================
// Verhalten der Seite (aus dem Template "kavelle" portiert, MIT-Lizenz).
// Jeder Block ist optional: gibt es das Element auf der Seite nicht, passiert nichts.
// Enthält KEINE Texte – alle Beschriftungen kommen aus src/content/.
// =============================================================================
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const queryAll = <T extends Element>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector));

if (!reducedMotion) root.classList.add('anim');

// Kopfzeile: nach dem ersten Scrollen dunkel; Handy-Menü
const topBar = document.querySelector<HTMLElement>('[data-top-bar]');
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
if (topBar) {
  const onScroll = () => topBar.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const setMenuOpen = (open: boolean) => {
    topBar.classList.toggle('open', open);
    burger?.setAttribute('aria-expanded', String(open));
  };
  burger?.addEventListener('click', () => setMenuOpen(!topBar.classList.contains('open')));
  queryAll<HTMLAnchorElement>('[data-panel] a').forEach((a) => a.addEventListener('click', () => setMenuOpen(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenuOpen(false));
}

// Slider: Überblendung alle 5 s, die Buchstaben des Titels steigen nacheinander auf
const slides = queryAll<HTMLElement>('[data-slide]');
if (slides.length) {
  const bars = queryAll<HTMLElement>('[data-bars] i');
  const counter = document.querySelector('[data-cur]');
  const DELAY = 5000;
  let current = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  slides.forEach((slide) => {
    const title = slide.querySelector('h2');
    if (!title) return;
    const text = title.textContent ?? '';
    title.setAttribute('aria-label', text);
    title.textContent = '';
    let letterIndex = 0;
    // Wortweise aufteilen, damit Wörter nie mitten im Wort umbrechen
    text.split(' ').forEach((word, w) => {
      if (w > 0) title.appendChild(document.createTextNode(' '));
      const wrapper = document.createElement('span');
      wrapper.className = 'w';
      wrapper.setAttribute('aria-hidden', 'true');
      [...word].forEach((char) => {
        const letter = document.createElement('span');
        letter.className = 'l';
        letter.textContent = char;
        letter.style.setProperty('--i', String(letterIndex++));
        wrapper.appendChild(letter);
      });
      title.appendChild(wrapper);
    });
  });

  const show = (n: number) => {
    current = (n + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('on', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      const button = slide.querySelector<HTMLElement>('.btn');
      if (button) button.tabIndex = i === current ? 0 : -1;
    });
    bars.forEach((bar, i) => (bar.className = i < current ? 'done' : ''));
    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
    if (!reducedMotion && bars[current]) {
      void bars[current].offsetWidth; // Animation neu starten
      bars[current].style.setProperty('--dur', DELAY + 'ms');
      bars[current].className = 'run';
    }
    clearTimeout(timer);
    if (!reducedMotion) timer = setTimeout(() => show(current + 1), DELAY);
  };

  document.querySelector('[data-prev]')?.addEventListener('click', () => show(current - 1));
  document.querySelector('[data-next]')?.addEventListener('click', () => show(current + 1));
  document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : show(current)));
  show(0);
}

// Zahlen zählen beim Einblenden hoch (nur reine Ganzzahlen ohne führende Null)
const countUp = (element: HTMLElement) => {
  const text = element.textContent?.trim() ?? '';
  if (!/^[1-9]\d*$/.test(text)) return;
  const end = Number(text);
  let start: number | undefined;
  const step = (time: number) => {
    start ??= time;
    const progress = Math.min(1, (time - start) / 1400);
    element.textContent = String(Math.round(end * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Einblenden beim Scrollen
const revealElements = queryAll<HTMLElement>('[data-in]');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        observer.unobserve(e.target);
        queryAll<HTMLElement>('[data-count]', e.target).forEach(countUp);
      }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('in'));
}

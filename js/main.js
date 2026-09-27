// Site-wide scripts

// Hero title: wrap each letter in a span for the load-in wave (see .char in style.css).
// Words stay unbreakable; screen readers get the plain text via aria-label.
// Separate inline-blocks lose the font's kerning, so each letter's x is measured in the
// unsplit text first and the split letters get margins to land back on those spots.
const title = document.querySelector('.hero__title');
if (title) {
  document.fonts.ready.then(() => {
    const text = title.textContent;
    const textNode = title.firstChild;
    const origin = title.getBoundingClientRect().left;
    const range = document.createRange();
    const targetX = [];
    for (let i = 0; i < text.length; i++) {
      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);
      targetX.push(range.getBoundingClientRect().left - origin);
    }

    let ci = 0;
    title.setAttribute('aria-label', text);
    title.innerHTML = text.split(' ').map((word) =>
      '<span class="word" aria-hidden="true">' +
      [...word].map((ch) => `<span class="char" style="--ci:${ci++}">${ch}</span>`).join('') +
      '</span>'
    ).join(' ');

    // Walk the letters left to right, nudging each one's right margin so the next lands on its target.
    const chars = title.querySelectorAll('.char');
    const letterIndex = [...text].flatMap((ch, i) => (ch === ' ' ? [] : [i]));
    chars.forEach((char, n) => {
      const next = chars[n + 1];
      if (!next) return;
      const drift = targetX[letterIndex[n + 1]] - (next.getBoundingClientRect().left - origin);
      char.style.marginRight = `${drift}px`;
    });
    title.classList.add('is-split');
  });
}

// Hero doodles: when idle, one random doodle at a time does a single bob. Hovering pauses
// that and bobs the hovered doodle until the cursor leaves (finishing its current bob).
// .is-ambient (1 cycle) and .is-bobbing (looping) share the same keyframes, so switching
// between them mid-bob continues smoothly instead of restarting.
const doodles = [...document.querySelectorAll('.doodle')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const AMBIENT_GAP_MS = 200; // pause between one doodle's bob and the next
let hoveredDoodle = null;
let ambientTimer = null;
let lastAmbient = null;

const scheduleAmbient = (delay) => {
  clearTimeout(ambientTimer);
  if (reduceMotion) return;
  ambientTimer = setTimeout(() => {
    if (hoveredDoodle || doodles.some((d) => d.classList.contains('is-bobbing'))) return;
    const choices = doodles.filter((d) => d !== lastAmbient);
    lastAmbient = choices[Math.floor(Math.random() * choices.length)];
    lastAmbient.classList.add('is-ambient');
  }, delay);
};

doodles.forEach((doodle, i) => {
  doodle.style.setProperty('--i', i); // entrance stagger order
  doodle.addEventListener('mouseenter', () => {
    hoveredDoodle = doodle;
    clearTimeout(ambientTimer);
    doodle.classList.add('is-bobbing');
    doodle.classList.remove('is-ambient');
  });
  doodle.addEventListener('mouseleave', () => {
    if (hoveredDoodle === doodle) hoveredDoodle = null;
  });
  doodle.addEventListener('animationiteration', () => {
    if (hoveredDoodle !== doodle) {
      doodle.classList.remove('is-bobbing');
      if (!hoveredDoodle) scheduleAmbient(AMBIENT_GAP_MS);
    }
  });
  doodle.addEventListener('animationend', (e) => {
    if (e.animationName !== 'bob') return;
    doodle.classList.remove('is-ambient');
    if (!hoveredDoodle) scheduleAmbient(AMBIENT_GAP_MS);
  });
});
scheduleAmbient(2600); // after the page-load entrance finishes

// Hero illustration: blink every ~1.5–4s (occasionally a double blink).
const art = document.querySelector('.hero__art');
if (art) {
  const BLINK_MS = 250;
  const blink = (then) => {
    art.classList.add('is-blinking');
    setTimeout(() => { art.classList.remove('is-blinking'); then(); }, BLINK_MS);
  };
  const scheduleBlink = () => {
    setTimeout(() => {
      if (Math.random() < 0.15) blink(() => setTimeout(() => blink(scheduleBlink), 150));
      else blink(scheduleBlink);
    }, 1500 + Math.random() * 2500);
  };
  scheduleBlink();
}

// Page fade-in for every page: [data-reveal] blocks fade up (see style.css). Blocks on screen
// at load are staggered in order; later ones animate as they scroll into view.
const revealBlocks = document.querySelectorAll('[data-reveal]');
if (revealBlocks.length) {
  let batchStart = performance.now();
  let batchIndex = 0;
  // Dark pages fade their background in from the light one first (style.css, 700ms);
  // the first batch waits for that so the content doesn't appear over a changing color.
  const reduceMotionReveal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let firstBatchDelay = document.body.classList.contains('page-dark') && !reduceMotionReveal ? 700 : 0;
  const observer = new IntersectionObserver((entries) => {
    const now = performance.now();
    if (now - batchStart > 100) { batchStart = now; batchIndex = 0; }
    const visible = entries.filter((e) => e.isIntersecting);
    visible.forEach((e) => {
      e.target.style.setProperty('--reveal-delay', `${firstBatchDelay + batchIndex++ * 120}ms`);
      e.target.classList.add('is-revealed');
      observer.unobserve(e.target);
    });
    if (visible.length) firstBatchDelay = 0;
  }, { rootMargin: '0px 0px -8% 0px' });
  revealBlocks.forEach((el) => observer.observe(el));
}

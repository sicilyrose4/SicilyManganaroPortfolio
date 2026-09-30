// Site-wide scripts

// Arriving from a dark page adds html.from-dark (inline script in <head>): the background fades
// dark → light for this long before anything else enters.
const enterOffset = document.documentElement.classList.contains('from-dark') &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 700 : 0;

// Leaving a dark page through one of our own links: tell the next (light) page to start dark.
if (document.body.classList.contains('page-dark')) {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (link.origin !== location.origin && location.protocol !== 'file:') return;
    try { sessionStorage.setItem('arrive-from-dark', '1'); } catch (err) {}
  });
}

// Fetch DM Mono Medium up front so the first hover-bold doesn't wait on a download.
if (document.fonts) document.fonts.load('500 14px "DM Mono"');

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
scheduleAmbient(2600 + enterOffset); // after the page-load entrance finishes

// TAKE A LOOK fades out as the first project scrolls into view: fully visible until the Workshop
// card's image area starts entering from the bottom, gone once that area is fully on screen.
// The fade drives the children (the link itself runs the page-load entrance animation).
const cta = document.querySelector('.hero__cta');
const firstMedia = document.querySelector('.project-card__media');
if (cta && firstMedia) {
  const updateCtaFade = () => {
    // Fade runs over the scroll distance between "media starts entering" and "media fully in view",
    // measured from the top of the page, so on tall screens it always starts fully visible.
    const r = firstMedia.getBoundingClientRect();
    const topInDoc = r.top + scrollY;
    const start = Math.max(0, topInDoc - innerHeight);
    const end = topInDoc + r.height - innerHeight;
    const progress = end <= 0 ? 0 : Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
    const fade = 1 - progress;
    cta.style.setProperty('--scroll-fade', fade.toFixed(3));
    cta.style.pointerEvents = fade < 0.05 ? 'none' : '';
  };
  addEventListener('scroll', updateCtaFade, { passive: true });
  addEventListener('resize', updateCtaFade);
  updateCtaFade();
}

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
// at load get the full entrance, staggered in order; blocks reached by scrolling rise in
// once a fifth of them is on screen, so the motion is actually seen.
const revealBlocks = document.querySelectorAll('[data-reveal]');
if (revealBlocks.length) {
  let batchStart = performance.now();
  let batchIndex = 0;
  let initialBatch = true;
  // Dark pages fade their background in from the light one first (style.css, 700ms);
  // the first batch waits for that so the content doesn't appear over a changing color.
  const reduceMotionReveal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstBatchDelay = (document.body.classList.contains('page-dark') && !reduceMotionReveal ? 700 : 0) + enterOffset;
  const observer = new IntersectionObserver((entries) => {
    const now = performance.now();
    if (now - batchStart > 100) { batchStart = now; batchIndex = 0; }
    const visible = entries.filter((e) => e.isIntersecting);
    visible.forEach((e) => {
      const delay = initialBatch ? firstBatchDelay + batchIndex++ * 120 : batchIndex++ * 80;
      e.target.style.setProperty('--reveal-delay', `${delay}ms`);
      if (!initialBatch) e.target.classList.add('is-scroll-revealed');
      e.target.classList.add('is-revealed');
      observer.unobserve(e.target);
    });
    initialBatch = false; // the observer's first report is the page-load state, even if nothing was visible yet
  }, { threshold: 0.2 }); // start once a fifth of the block is on screen (the footer can always reach this)
  revealBlocks.forEach((el) => observer.observe(el));
}

// Password gate (workshop-locked.html). A light gate for a static site: it keeps casual visitors
// out, but anything published can still be found by someone determined. The answer is stored
// base64-encoded so it isn't sitting in plain text. Unlocks last until the tab is closed.
const PROJECT_PASSWORDS = { workshop: 'ZGVzaWdu' };
const gate = document.querySelector('[data-password-gate]');
if (gate) {
  const project = gate.dataset.passwordGate;
  const next = gate.dataset.next;
  const form = gate.querySelector('.lock__form');
  const field = gate.querySelector('.lock__field');
  const input = gate.querySelector('.lock__input');
  const error = gate.querySelector('.lock__error');
  const unlockKey = `unlocked:${project}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = false;
    try { ok = btoa(input.value.trim()) === PROJECT_PASSWORDS[project]; } catch (err) {}
    if (ok) {
      try { sessionStorage.setItem(unlockKey, '1'); } catch (err) {}
      location.href = next;
      return;
    }
    error.textContent = 'That password isn’t right.';
    field.classList.remove('is-wrong');
    void field.offsetWidth; // restart the shake on repeated misses
    field.classList.add('is-wrong');
    input.value = '';
    input.focus();
  });
  input.addEventListener('input', () => { error.textContent = ''; });
}

// Footer car (home page): when the car is fully on screen it drives left until its front bumper is
// 56px past the LinkedIn icon (~6s), switching frames every 40px travelled, then parks on frame 2.
// On narrow screens the car sits under the footer row instead, and drives to the left edge.
// Once it's scrolled completely out of view it resets to the start, so it drives again every time
// it comes back into view.
const car = document.querySelector('.footer-car');
if (car) {
  const footer = car.closest('.site-footer');
  const social = footer.querySelector('.site-footer__social');
  const STOP_GAP = 56; // Figma: parked bumper → LinkedIn icon
  // How far to drive, measured from the car's resting spot (offsetLeft ignores the transform).
  const travelDistance = () => {
    const f = footer.getBoundingClientRect();
    const s = social.getBoundingClientRect();
    const carTop = car.offsetTop, carBottom = carTop + car.offsetHeight;
    const besideRow = s.bottom - f.top > carTop && s.top - f.top < carBottom;
    const stopAt = besideRow ? s.right - f.left + STOP_GAP : 0;
    return Math.max(0, car.offsetLeft - stopAt);
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 6000;
  // Pull away at speed (so the car moves as soon as the wheels start turning), then ease into
  // the parking spot. An ease-in start left the frames flipping while the car barely moved.
  const ease = (t) => 1 - Math.pow(1 - t, 2.2);
  let state = 'waiting'; // waiting | driving | parked
  let raf = 0, startTimer = 0;

  const stopTimers = () => { cancelAnimationFrame(raf); clearTimeout(startTimer); };
  const park = () => {
    stopTimers();
    state = 'parked';
    car.style.transform = `translateX(${-travelDistance()}px)`;
    car.classList.add('show-frame-2');
  };
  const reset = () => {
    stopTimers();
    state = 'waiting';
    car.style.transform = '';
    car.classList.remove('show-frame-2');
  };
  const FLIP_EVERY = 40; // px travelled per frame switch, so the wheels turn in step with the speed
  const drive = () => {
    state = 'driving';
    const distance = travelDistance();
    const begin = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - begin) / DURATION);
      const travelled = distance * ease(t);
      car.style.transform = `translateX(${-travelled}px)`;
      car.classList.toggle('show-frame-2', Math.floor(travelled / FLIP_EVERY) % 2 === 1);
      if (t < 1) raf = requestAnimationFrame(step);
      else park();
    };
    raf = requestAnimationFrame(step);
  };

  if (reduce) {
    park();
  } else {
    new IntersectionObserver((entries) => {
      const ratio = entries[entries.length - 1].intersectionRatio;
      if (ratio >= 0.99 && state === 'waiting') {
        clearTimeout(startTimer);
        startTimer = setTimeout(drive, 350); // let the footer's fade-in land first
      } else if (ratio === 0) {
        reset(); // fully out of view: back to the start for next time
      }
    }, { threshold: [0, 0.99] }).observe(car);
  }
  // keep it parked in the right spot if the window is resized after the drive
  addEventListener('resize', () => { if (state === 'parked') car.style.transform = `translateX(${-travelDistance()}px)`; });
}

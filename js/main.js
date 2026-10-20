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

// Back link on project pages: "BACK TO HOME" if the visitor came in from the home page, otherwise
// "BACK TO WORK" (the Work page, which is also the default for direct visits). The referrer says
// where they came from; the home and Work pages also note it on click, as a fallback.
const ENTERED_KEY = 'entered-from';
if (document.querySelector('.hero, .work-grid')) {
  const here = document.querySelector('.work-grid') ? 'work' : 'home';
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) { try { sessionStorage.setItem(ENTERED_KEY, here); } catch (err) {} }
  });
}
const backLinks = document.querySelectorAll('.back-link');
if (backLinks.length) {
  let from = null;
  try {
    const ref = new URL(document.referrer);
    if (ref.origin === location.origin) {
      if (/\/work\.html$/.test(ref.pathname)) from = 'work';
      else if (/\/(index\.html)?$/.test(ref.pathname)) from = 'home';
    }
  } catch (err) {}
  try {
    if (from) sessionStorage.setItem(ENTERED_KEY, from);
    else from = sessionStorage.getItem(ENTERED_KEY);
  } catch (err) {}
  if (from === 'home') {
    backLinks.forEach((backLink) => {
      backLink.href = 'index.html#work';
      const label = [...backLink.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
      if (label) label.textContent = label.textContent.replace('BACK TO WORK', 'BACK TO HOME');
    });
  }
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
  if (reduceMotion || !doodles.length) return; // pages without the hero have no doodles
  ambientTimer = setTimeout(() => {
    if (hoveredDoodle || doodles.some((d) => d.classList.contains('is-bobbing'))) return;
    // Only doodles on screen: every page also carries the phone screen's drawing, hidden on desktop
    const choices = doodles.filter((d) => d !== lastAmbient && d.offsetParent !== null);
    if (!choices.length) { scheduleAmbient(1000); return; }
    lastAmbient = choices[Math.floor(Math.random() * choices.length)];
    lastAmbient.classList.add('is-ambient');
  }, delay);
};

doodles.forEach((doodle) => {
  // entrance stagger order, counted within each drawing
  doodle.style.setProperty('--i', [...doodle.parentElement.querySelectorAll(':scope > .doodle')].indexOf(doodle));
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
// (Every page has the phone screen's copy of the drawing too, so blink them all.)
const arts = document.querySelectorAll('.hero__art');
if (arts.length) {
  const BLINK_MS = 250;
  const blink = (then) => {
    arts.forEach((a) => a.classList.add('is-blinking'));
    setTimeout(() => { arts.forEach((a) => a.classList.remove('is-blinking')); then(); }, BLINK_MS);
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

// Footer car (home page): the car rides the footer's road (the SVG path), wheels on the line and
// tilted to the slope. When it's fully on screen it drives left, up the hill toward the email; about
// 15px from the text it stops, rolls back down to where it started, and goes again. It switches
// frames every 40px travelled either way. Once scrolled completely out of view it resets.
const road = document.querySelector('.footer-road');
if (road) {
  const car = road.querySelector('.footer-car');
  const path = road.querySelector('path');
  const svg = road.querySelector('svg');
  const email = document.querySelector('.site-footer__email');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Figma frame: 1440 wide, footer from y 3019, 284 tall. The car starts with its rear wheel at x 1080.
  const FIGMA_W = 1440, FIGMA_TOP = 3019, FIGMA_H = 284, START_REAR_X = 1080;
  const REAR = [0.7925, 0.99], FRONT = [0.1196, 0.99]; // wheel contact points, as fractions of the car box
  // Top and front edge of the car drawing (fractions of the box), for measuring the gap to the text
  const OUTLINE = [[0, 0.689], [0.029, 0.579], [0.041, 0.496], [0.078, 0.408], [0.158, 0.395],
    [0.238, 0.386], [0.318, 0.364], [0.354, 0.246], [0.385, 0.162], [0.439, 0.127], [0.479, 0.035],
    [0.52, 0.009], [0.6, 0.07]];
  const TEXT_GAP = 15;     // stop this far from the email
  const EDGE_GAP = 16;     // ...or from the window's left edge (the gutter), whichever comes first
  const MAX_TILT = (20 * Math.PI) / 180; // ...or once the slope gets this steep (small screens squeeze the hill)
  const FLIP_EVERY = 40;   // px travelled per frame switch, so the wheels turn in step with the speed
  const UP_MS = 5000, DOWN_MS = 3000, REST_MS = 500;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

  // The road as a polyline in the road box's px, with running length.
  let pts = [], lens = [], carW = 0, carH = 0, startLen = 0, stopLen = 0;
  const measure = () => {
    const kx = road.clientWidth / FIGMA_W, ky = svg.clientHeight / FIGMA_H;
    const total = path.getTotalLength();
    pts = []; lens = [];
    for (let i = 0, run = 0; i <= 1000; i++) {
      const p = path.getPointAtLength((total * i) / 1000);
      const q = [p.x * kx, (p.y - FIGMA_TOP) * ky];
      if (i) run += Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]);
      pts.push(q); lens.push(run);
    }
    carW = car.offsetWidth; carH = car.offsetHeight;
    const startX = START_REAR_X * kx;
    startLen = lens[pts.findIndex((q) => q[0] >= startX)];
    stopLen = findStop();
  };
  const pointAt = (len) => {
    let i = lens.findIndex((l) => l >= len);
    if (i <= 0) return pts[Math.max(i, 0)];
    const t = (len - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    return [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])];
  };
  // Rear wheel at `len` along the road; the front wheel is one wheelbase further on (to the left).
  const pose = (len) => {
    const rear = pointAt(len);
    const base = (REAR[0] - FRONT[0]) * carW;
    let fl = len - base, front = pointAt(fl);
    for (let k = 0; k < 4; k++) { // walk until the straight-line gap equals the wheelbase
      fl += Math.hypot(rear[0] - front[0], rear[1] - front[1]) - base;
      front = pointAt(fl);
    }
    const angle = Math.atan2(rear[1] - front[1], rear[0] - front[0]);
    return { rear, angle };
  };
  const place = (len) => {
    const { rear, angle } = pose(len);
    const lift = 1; // half the road's 2px stroke: tyres sit on top of the line
    car.style.transform = `translate(${rear[0]}px, ${rear[1] - lift}px) rotate(${angle}rad) ` +
      `translate(${-REAR[0] * carW}px, ${-REAR[1] * carH}px)`;
  };
  // Gap between the car's outline and the email (and the window's left edge), for the car at `len`.
  const gaps = (len) => {
    const { rear, angle } = pose(len);
    const r = road.getBoundingClientRect(), e = email.getBoundingClientRect();
    const box = [e.left - r.left, e.top - r.top, e.right - r.left, e.bottom - r.top];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    let min = Infinity, left = Infinity;
    OUTLINE.forEach(([fx, fy]) => {
      const lx = (fx - REAR[0]) * carW, ly = (fy - REAR[1]) * carH;
      const x = rear[0] + lx * cos - ly * sin, y = rear[1] - 1 + lx * sin + ly * cos;
      const dx = Math.max(box[0] - x, 0, x - box[2]), dy = Math.max(box[1] - y, 0, y - box[3]);
      min = Math.min(min, Math.hypot(dx, dy));
      left = Math.min(left, x + r.left);
    });
    return { text: min, edge: left };
  };
  // Drive left in small steps until the car is TEXT_GAP from the email, EDGE_GAP from the window's
  // edge, tilted MAX_TILT, or out of road.
  const findStop = () => {
    const minLen = (REAR[0] - FRONT[0]) * carW + 20;
    let len = startLen;
    const clear = (l) => {
      const g = gaps(l);
      return g.text > TEXT_GAP && g.edge >= EDGE_GAP && pose(l).angle <= MAX_TILT;
    };
    while (len - 2 > minLen && clear(len - 2)) len -= 2;
    return len;
  };

  let raf = 0, timer = 0, running = false;
  const setFrame = (travelled) => car.classList.toggle('show-frame-2', Math.floor(travelled / FLIP_EVERY) % 2 === 1);
  const stop = () => { cancelAnimationFrame(raf); clearTimeout(timer); running = false; };
  const reset = () => { stop(); measure(); place(startLen); car.classList.remove('show-frame-2'); };
  // One leg of the trip: from `from` to `to` along the road over `ms`, then `then()`.
  const leg = (from, to, ms, travelledBefore, then) => {
    const begin = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - begin) / ms);
      const len = from + (to - from) * easeInOut(t);
      place(len);
      setFrame(travelledBefore + Math.abs(len - from));
      if (t < 1) raf = requestAnimationFrame(step);
      else then(travelledBefore + Math.abs(to - from));
    };
    raf = requestAnimationFrame(step);
  };
  const cycle = () => {
    measure();
    leg(startLen, stopLen, UP_MS, 0, (travelled) => {
      leg(stopLen, startLen, DOWN_MS, travelled, () => { timer = setTimeout(cycle, REST_MS); });
    });
  };

  const init = () => {
    reset();
    if (reduce) return;
    new IntersectionObserver((entries) => {
      const ratio = entries[entries.length - 1].intersectionRatio;
      if (ratio >= 0.99 && !running) {
        running = true;
        timer = setTimeout(cycle, 350); // let the footer's fade-in land first
      } else if (ratio === 0) {
        reset(); // fully out of view: back to the start for next time
      }
    }, { threshold: [0, 0.99] }).observe(car);
  };
  // the email's width (web font) decides where the car stops, so wait for fonts
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
  addEventListener('resize', () => {
    const wasRunning = running;
    reset();
    if (wasRunning && !reduce) { running = true; timer = setTimeout(cycle, 350); }
  });
}

// Phone screen menu (Figma 579:20053). Opening: the three lines turn into the X while the drawing
// fades out, then Work / About / Contact fade up one by one. Closing plays it backwards. Escape or
// the X closes it. Steps are timed here; the motion itself is in style.css (.mgate).
const mgate = document.querySelector('[data-mobile-gate]');
if (mgate) {
  const toggle = mgate.querySelector('.mgate__toggle');
  const menu = mgate.querySelector('.mgate__menu');
  const body = mgate.querySelector('.mgate__body');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = still ? 0 : 250;     // drawing fade (matches .mgate__body transition)
  const LINKS_OUT_MS = still ? 0 : 320; // last link finishes fading out
  let step = null;
  const setOpen = (open) => {
    clearTimeout(step);
    mgate.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.classList.remove('is-out');
      body.classList.add('is-faded');
      step = setTimeout(() => {
        body.classList.add('is-away');
        body.setAttribute('aria-hidden', 'true');
        menu.hidden = false;
        menu.classList.add('is-in');
      }, FADE_MS);
    } else {
      menu.classList.remove('is-in');
      menu.classList.add('is-out');
      step = setTimeout(() => {
        menu.hidden = true;
        menu.classList.remove('is-out');
        body.classList.remove('is-away');
        body.removeAttribute('aria-hidden');
        requestAnimationFrame(() => requestAnimationFrame(() => body.classList.remove('is-faded')));
      }, LINKS_OUT_MS);
    }
  };
  toggle.addEventListener('click', () => setOpen(!mgate.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mgate.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
}

// See more projects (every project page): the arrows slide the row one tile at a time and stop at
// the ends; each arrow fades out when there's nothing more on its side.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.more__track');
  const viewport = carousel.querySelector('.more__viewport');
  const prev = carousel.querySelector('.more__arrow--prev');
  const next = carousel.querySelector('.more__arrow--next');
  const tiles = [...track.children];
  const last = Math.max(0, tiles.length - 2); // two tiles show at once
  let index = 0;
  const show = () => {
    track.style.transform = `translateX(${-tiles[index].offsetLeft}px)`;
    prev.classList.toggle('is-hidden', index === 0);
    next.classList.toggle('is-hidden', index === last);
  };
  prev.addEventListener('click', () => { if (index > 0) { index -= 1; show(); } });
  next.addEventListener('click', () => { if (index < last) { index += 1; show(); } });
  addEventListener('resize', show);
  // Tabbing onto a tile that's out of view slides it in (and undoes the browser's own scroll)
  track.addEventListener('focusin', (e) => {
    const i = tiles.indexOf(e.target.closest('.work-tile'));
    viewport.scrollLeft = 0;
    if (i < index || i > index + 1) { index = Math.min(i, last); show(); }
  });
  show();
});

// Magnifier (Workshop user flow): hovering shows a round lens that follows the cursor and shows that
// spot at 3x from a high-res copy, loaded on first hover. Mouse/trackpad only.
const ZOOM = 3;
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('[data-magnify]').forEach((box) => {
    const img = box.querySelector('img');
    const lens = box.querySelector('.magnify__lens');
    let loaded = false;
    const move = (e) => {
      const r = img.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      lens.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      lens.style.backgroundPosition = `${lens.offsetWidth / 2 - x * ZOOM}px ${lens.offsetHeight / 2 - y * ZOOM}px`;
    };
    box.addEventListener('mouseenter', (e) => {
      if (!loaded) { lens.style.backgroundImage = `url("${box.dataset.magnify}")`; loaded = true; }
      move(e);
      box.classList.add('is-zooming');
    });
    box.addEventListener('mousemove', move);
    box.addEventListener('mouseleave', () => box.classList.remove('is-zooming'));
  });
}


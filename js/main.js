// Site-wide scripts

// Hero doodles: bob while hovered, then finish the current bob before stopping.
document.querySelectorAll('.doodle').forEach((doodle) => {
  let hovered = false;
  doodle.addEventListener('mouseenter', () => {
    hovered = true;
    doodle.classList.add('is-bobbing');
  });
  doodle.addEventListener('mouseleave', () => {
    hovered = false;
  });
  doodle.addEventListener('animationiteration', () => {
    if (!hovered) doodle.classList.remove('is-bobbing');
  });
});

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

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

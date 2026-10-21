# Sicily Manganaro — Portfolio (2026 redesign)

Rebuild of sicilymanganaro.com. Designs live in Figma; code implements them.

## Stack
- Plain HTML / CSS / JS, no build step. Hosted on GitHub Pages.
- One `.html` file per page at the root; shared styles in `css/style.css`, scripts in `js/main.js`.
- Assets in `assets/images`, `assets/videos`, `assets/fonts`.
- Preview: `python3 serve.py` → http://localhost:8080 (GitHub-Pages-like: missing pages get `404.html`, no caching). Opening files directly (`file://`) can't show the custom 404.

## Rules
- Match the Figma frames closely (spacing, type, color). Pull tokens into `:root` in `style.css`.
- Never create original art, icons, or fonts — Sicily provides all assets. Use a clear placeholder and ask if something is missing.
- Ask before inventing interactions/animations the designs don't specify.

## Publishing
- Launched 2026-10-12: this project is the live site. `origin` is `sicilyrose4/SicilyManganaroPortfolio` (GitHub Pages from `main`, custom domain via `CNAME` → `www.sicilymanganaro.com`). Pushing `main` publishes.
- The previous site's history is kept in the repo (merged in at launch); `~/Documents/sicily` is the old working copy.

## Password-protected projects
- `workshop-locked.html` is the gate for the Workshop project (password stored base64 in `PROJECT_PASSWORDS` in `js/main.js`; not written here because this repo is public). A correct entry sets `sessionStorage['unlocked:workshop']` and goes to `workshop.html`.
- When `workshop.html` is built, put this first in its `<head>` so it can't be opened without unlocking, and point the Workshop card on the home page at `workshop.html`:
  `<script>try { if (!sessionStorage.getItem('unlocked:workshop')) location.replace('workshop-locked.html'); } catch (e) { location.replace('workshop-locked.html'); }</script>`
- This is a light gate only (static hosting): don't publish anything that must stay truly private.

## Bone Dry case study
- `bone-dry.html` (Figma 340:2951) is a light page on pure white with full-width dark/gray bands. All its styles are the `.bd-*` block at the end of `style.css`; comments there give the Figma y positions.
- Copy is real text. Illustrations and game screens are PNGs cut from the Figma frame at 2x (`assets/images/bone-dry/`); if the Figma changes, re-export the frame at 2x and re-crop.
- The playable game is embedded in an iframe from `https://sicilyrose4.github.io/bone-dry/` (repo `sicilyrose4/bone-dry`, source in `~/Documents/IXD 432/bone dry`). Updating the game there updates the embed.

## Work page and Bull Stock
- `work.html` (Figma 200:1898): a grid of 501×276 tiles in `assets/images/work-page/`, cut whole from the Figma frame at 2x. Rebound, Depop and Fizz have no case study pages yet, so their tiles link to `in-progress.html`.
- Header and footer "Work" links go to `work.html`; the home page's SEE MORE button does too.
- `bull-stock.html` has no Figma frame: its layout was approved from a mockup. It shares the Bone Dry `.bd-*` styles plus `.bs-*`. Images come from the group project's Figma file (`ny9fhUlVOT652zelldNh02`), read-only. It is linked from the Work page only, not from a home card.

## In-progress page
- `in-progress.html` (Figma 483:7596) is where any project without a case study leads: the Rebound, Depop and Fizz tiles.
- When a real case study is built, point its tile (and for Workshop, `data-next`) at the new page instead.
- It reuses the home hero doodles (`.doodle`, bobbed by `js/main.js`); the title's three dots type in on a CSS loop (`.wip__dots`).

## Workshop case study
- `workshop.html` is built from Figma 537:5547 ("workshop — expanded draft"); the gate script is first in its `<head>`, and `workshop-locked.html` sends a correct password there (`data-next`). Home card and Work tile still point at the gate.
- Light page on Figma's #faf8f7 (exports have it baked in around their shadows). Styles are the `.ws-*` block at the end of `style.css`.
- Screens are 2x exports in `assets/images/workshop/`. Step rows (`.ws-comp`) place each screen at its Figma position as percentages of the 1022px column; the numbered labels below are real text (`.ws-steps`).
- Spacing is one scale, not Figma's exact y positions (Sicily asked for equal gaps): 120px above and below every divider (measured to the visible screen, not its baked-in shadow), 160px before each sub-heading, 56px from text to its visuals, 64px between step rows.
- The user-flow image has a hover magnifier (`.magnify`, `js/main.js`): a round lens at 3x from `flow-large.jpg`, mouse/trackpad only.

## Phone screen (desktop-only for now)
- Every page starts with the `.mgate` block (Figma 579:20032, menu 579:20053). Below 768px it replaces the page ("Grab your laptop!"); above that it's hidden. If you add a page, copy the block in right after `<body>`.
- Its drawing is a copy of the home hero art (`.hero__art.mgate__art`), so it bobs and blinks with the same code; that code skips hidden doodles and blinks every `.hero__art`.
- Menu motion (approved): the three lines turn into the X while the drawing fades out, then the links fade up one by one; closing reverses it. Steps in `js/main.js`, motion in the `.mgate` CSS.

## Luna case study
- `luna.html` follows Figma 607:22537 ("Luna phase project page 2"). The top (intro, header + collage videos, problem/solution) is the original build; everything below is the `.lv` block: each element sits at its Figma x/y inside the 1022 column in `--px`, so the whole thing scales as one piece.
- That block is generated by a script from the Figma positions (images are 2x exports in `assets/images/luna/v2/`, text is real HTML). If the frame changes, re-read positions and regenerate rather than hand-nudging.
- Video fills in Figma map to `assets/videos/luna/`: Behance 9/10 → app-walkthrough-1/2, the laptop/phone recordings → website-desktop/mobile (cropped inside `.lv__clip`).
- Exports carry the page's #111; the floating product renders use `mix-blend-mode: lighten` so they sit on the navy band. Bands are 30% opacity, as in Figma.

## See more projects (every project page)
- The `.more` carousel (Figma 552:13726) sits at the end of Luna, Drop, Workshop, Bone Dry (inside its dark footer band) and Bull Stock. It holds the Work-page tiles for Luna, Drop, Workshop and Bone Dry, minus the page you're on.
- The tiles span the full content column (lined up with the title and the rest of the page); the arrows sit just outside it. Below 1140px wide the tiles inset 48px so the arrows stay on screen.
- Two tiles show at a time; the arrows (back-link circle turned sideways) slide one tile and hide when there's nothing more on that side (`js/main.js`). To add a project, add its tile to each page's `.more__track`.
- The back link sits under the carousel (`.more__back`). Every `.back-link` reads BACK TO WORK, or BACK TO HOME (→ `index.html#work`) if the visitor came from the home page.

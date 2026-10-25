# Sicily Manganaro — Portfolio (2026 redesign)

Rebuild of sicilymanganaro.com. Designs live in Figma; code implements them.

## Stack
- Plain HTML / CSS / JS, no build step. Hosted on GitHub Pages.
- One `.html` file per page at the root; shared styles in `css/style.css`, scripts in `js/main.js`.
- Assets in `assets/images`, `assets/videos`, `assets/fonts`.
- Preview: `python3 serve.py` → http://localhost:8080 (GitHub-Pages-like: missing pages get `404.html`, no caching). Opening files directly (`file://`) can't show the custom 404.

## Favicon
- The tab icon is the SM logo (`assets/images/logo-sm.svg`): `favicon.svg`, `favicon.ico` and `apple-touch-icon.png` (on #fcfcfc) at the root, linked right after `<title>` on every page (in `404.html`, after its `<base>` script). New pages need the same three `<link>` tags.

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
- Game logic has the same hover magnifier as Workshop's flow (`game-logic-large.jpg`, a 3.6x Figma export of 483:5426 padded to line up with `game-logic.png`; re-make both if the chart changes). On phones it scrolls sideways from the left margin to the screen edge; the recipe cards are hidden, and the Round 2 mood board is cropped to drop its arrow.
- The playable game is embedded in an iframe from `https://sicilyrose4.github.io/bone-dry/` (repo `sicilyrose4/bone-dry`, source in `~/Documents/IXD 432/bone dry`). Updating the game there updates the embed.

## Work page and Bull Stock
- **On hold (2026-10-21):** the Work page is out of the navigation. The home page shows Workshop, Social Block, Luna, Bone Dry, Drop, Bull Stock (in that order, no SEE MORE), and every back link reads BACK TO HOME → `index.html#work`. `work.html` still exists but nothing links to it.
- `work.html` (Figma 200:1898): a grid of 501×276 tiles in `assets/images/work-page/`, cut whole from the Figma frame at 2x. Rebound, Depop and Fizz have no case study pages yet, so their tiles link to `in-progress.html`.
- `bull-stock.html` has no Figma frame: its layout was approved from a mockup. It shares the Bone Dry `.bd-*` styles plus `.bs-*`. Images come from the group project's Figma file (`ny9fhUlVOT652zelldNh02`), read-only. Home card (Figma 717:8596, last on the page): background gradient, the logo (`assets/images/work/bull-stock-logo.svg`, Figma group 717:8962 with the export's backgrounds stripped) and two phone screens (`bull-stock-home.png` in front, `bull-stock-details.png` behind; 2x crops with their corners rounded, shadows in CSS). Its Try It section has the group's Figma prototype, then the coded prototype (`sicilyrose4.github.io/bull-stock`) with a note under it that Sicily rebuilt it on her own with Claude Code after the group project.

## In-progress page
- `in-progress.html` (Figma 483:7596) is where any project without a case study leads: the Rebound, Depop and Fizz tiles.
- When a real case study is built, point its tile (and for Workshop, `data-next`) at the new page instead.
- It reuses the home hero doodles (`.doodle`, bobbed by `js/main.js`); the title's three dots type in on a CSS loop (`.wip__dots`).

## Workshop case study
- `workshop.html` is built from Figma 537:5547 ("workshop — expanded draft"); the gate script is first in its `<head>`, and `workshop-locked.html` sends a correct password there (`data-next`). Home card and Work tile still point at the gate.
- Light page on Figma's #faf8f7 (exports have it baked in around their shadows). Styles are the `.ws-*` block at the end of `style.css`.
- Screens are 2x exports in `assets/images/workshop/`. Step rows (`.ws-comp`) place each screen at its Figma position as percentages of the 1022px column; the numbered labels below are real text (`.ws-steps`).
- Spacing is one scale, not Figma's exact y positions (Sicily asked for equal gaps): 120px above and below every divider (measured to the visible screen, not its baked-in shadow), 160px before each sub-heading, 56px from text to its visuals, 64px between step rows.
- Phones (approved 2026-10-21): images stay inside the margins except the hero and the solution calendar, which run off the right edge, and the user flow, which scrolls sideways from the left margin to the screen edge. Step labels sit above their screens (`--o` order), 80px between flows, Before/After labels on top, Cici above the phases, explorations (`.ws-comp--ex`) restacked two-up then one per row.
- The user-flow image has a hover magnifier (`.magnify`, `js/main.js`): a round lens at 3x from `flow-large.jpg`, mouse/trackpad only.

## Phones
- The "Grab your laptop!" screen is gone (removed 2026-10-22 at Sicily's request): every page shows on phones. What's left of it is the `.mgate` bar, which is the phone header below 768px (logo + menu; the approved line→X animation, links About / Contact / Resume) while the desktop header hides. On the dark pages (`.page-dark`: Luna, Drop) the menu button and links are #bbc0cc. Every `<body>` still carries `m-ok`; some phone rules key off it, so keep it on new pages.
- Phone layouts designed so far: `index.html`, `about.html`, `workshop-locked.html`, `workshop.html`, `luna.html`, `bone-dry.html`, `drop.html`, `social-block.html`; the rest (Bull Stock, Work, In progress) show their basic responsive layout until they get one.
- Phone layout follows Figma 300:8611: an 8-column grid (20 gutter, no margin), so content runs from column 2 to 7, `max(20px, 13.141vw)` each side (51.25 at 390). Home hero: drawing 234 wide, title 42/40, intro split before "Recently designing…", TAKE A LOOK (fades faster on phones). Cards: 287-wide images shortened to 287×360, logo centered on top, screen below running off the right.
- Every page starts with the `.mgate` block (bar + menu); if you add a page, copy it in right after `<body>`.
- About uses the road footer with its email line kept invisible (`.site-footer__contact--spacer`): the road and car are measured from that line, so don't delete it.

## Home header
- On the home page (`body.page-home`) the header, or the phone bar on phones, is sticky: scrolling down tucks it above the window and scrolling up brings it back (`js/main.js`, `.page-home` rules in `style.css`).

## About page
- `about.html` follows Figma 631:8730. Styles are the `.about*` block at the end of `style.css` (comments give Figma y). The portrait is `assets/images/about/portrait.png` (2x, transparent) inside a bordered card.
- Every About link (header, phone menu, footer) points to `about.html`; on that page the nav marks it with `aria-current="page"` (bold).
- It keeps the site's current header and uses the home page's road footer (email + car).

## Luna case study
- `luna.html` follows Figma 607:22537 ("Luna phase project page 2"). The top (intro, header + collage videos, problem/solution) is the original build; everything below is the `.lv` block: each element sits at its Figma x/y inside the 1022 column in `--px`, so the whole thing scales as one piece.
- That block is generated by a script from the Figma positions (images are 2x exports in `assets/images/luna/v2/`, text is real HTML). If the frame changes, re-read positions and regenerate rather than hand-nudging.
- Video fills in Figma map to `assets/videos/luna/`: Behance 9/10 → app-walkthrough-1/2, the laptop/phone recordings → website-desktop/mobile (cropped inside `.lv__clip`).
- Phones: the `.lv` block becomes a 6-column stack (CSS only, picked by image `src`); bands and loose arrows are hidden. Two parts keep their desktop arrangement, scaled as one piece, inside `.lv__group` wrappers (`display: contents` on desktop, Figma bounds in `--gx/--gy/--gw/--gh`): the website recordings with the two long site strips, and the earbud rendering rows. The header collage and the two walk-through videos are swapped for clips cut from the same footage (`assets/videos/luna/collage-tiles/`, posters in `assets/images/luna/collage-tiles/`, cut with ffmpeg). They live in `.m-col` / `.m-wt` with `data-phone-videos`, so `js/main.js` loads and plays them on phones only. The generated block's HTML order was hand-edited for phones (desktop unaffected, everything is absolutely placed): the two `.lv__group` wrappers; laptop recording before the phone recording; Sleep stats screen right after its sketch, then the charts, then the "Tap Heart Rate…" caption; plus the added "The app explained:" heading and `.m-wt`. Keep these if the block is regenerated.
- Exports carry the page's #111; the floating product renders use `mix-blend-mode: lighten` so they sit on the navy band. Bands are 30% opacity, as in Figma.

## Social Block case study
- `social-block.html` follows Figma 556:6053 ("social block — draft"). Light Workshop look: it reuses the `.ws-*` styles plus the `.sb-*` block in `style.css` (comments give Figma y). Visuals are 2x exports in `assets/images/social-block/`; the initial flow places its six screens, labels and the four drag arrows (`arrow-*.svg`) at their Figma positions (`.sb-flow`), and stacks label-then-screen on phones.
- It's a Workshop internship project, so it shares Workshop's password and unlock: `social-block-locked.html` (same gate, `data-next="social-block.html"`) and the same `unlocked:workshop` check first in its `<head>`.
- Home card (Figma 595:22182) sits second, after Workshop, and links to `social-block-locked.html`. Its See more tile is `assets/images/work-page/social-block.png` (Figma 692:8041, exported at 1002×552).

## Drop case study
- `drop.html` follows Figma 651:8736 ("drop — draft"), in the Bone Dry / Workshop format on Drop's dark #1c1c1c with the lime #ebffae accent. Styles are the `.dp-*` block in `style.css` (comments give Figma y).
- Visuals are 2x exports in `assets/images/drop/v2/` (the hero is two overlapping screens; boards keep their annotations). Some come from the Drop working file (`MMF58JIeVYs8L0I16zReIs`, read-only): early wireframes, hover states, the See Details overlay.
- "Try it out" embeds the live Figma prototype. The old board images in `assets/images/drop/` are no longer used.

## See more projects (every project page)
- The `.more` carousel (Figma 552:13726) sits at the end of Luna, Drop, Workshop, Social Block, Bone Dry (inside its dark footer band) and Bull Stock. It holds the Work-page tiles for Luna, Drop, Workshop, Social Block, Bone Dry and Bull Stock, minus the page you're on (Social Block sits right after Workshop; Bull Stock is last).
- The tiles span the full content column (lined up with the title and the rest of the page); the arrows sit just outside it. Below 1140px wide the tiles inset 48px so the arrows stay on screen.
- Two tiles show at a time; the arrows (back-link circle turned sideways) slide one tile and hide when there's nothing more on that side (`js/main.js`). To add a project, add its tile to each page's `.more__track`.
- The back link sits under the carousel (`.more__back`). Every `.back-link` reads BACK TO WORK, or BACK TO HOME (→ `index.html#work`) if the visitor came from the home page.

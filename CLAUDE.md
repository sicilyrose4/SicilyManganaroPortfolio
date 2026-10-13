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

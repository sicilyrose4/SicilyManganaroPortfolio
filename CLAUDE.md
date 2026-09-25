# Sicily Manganaro — Portfolio (2026 redesign)

Rebuild of sicilymanganaro.com. Designs live in Figma; code implements them.

## Stack
- Plain HTML / CSS / JS, no build step. Hosted on GitHub Pages.
- One `.html` file per page at the root; shared styles in `css/style.css`, scripts in `js/main.js`.
- Assets in `assets/images`, `assets/videos`, `assets/fonts`.
- Preview: `.claude/launch.json` → `python3 -m http.server 8080`.

## Rules
- Match the Figma frames closely (spacing, type, color). Pull tokens into `:root` in `style.css`.
- Never create original art, icons, or fonts — Sicily provides all assets. Use a clear placeholder and ask if something is missing.
- Ask before inventing interactions/animations the designs don't specify.

## Launch plan
- The live site is `~/Documents/sicily` → repo `sicilyrose4/SicilyManganaroPortfolio` (custom domain via CNAME `www.sicilymanganaro.com`).
- This project stays separate until it's ready; at launch, push it to that repo (keeping the CNAME) so the domain carries over.

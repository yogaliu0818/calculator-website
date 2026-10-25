# Calculator Website

Buildless nine-language product website. Open `index.html` locally; no server,
framework, analytics, remote fonts or runtime library is required.

GitHub Pages serves the `main` branch root at
https://yogaliu0818.github.io/calculator-website/ . Preserve this repository,
public URL and audience; do not create a duplicate hosting project for a redesign.
The Android App is maintained separately in `../apple_calculator_apk/www`.

## Architecture

- `index.html`: product presentation, feature tabs, scientific mode, three-theme
  preview, glass switch, tablet showcase and Play download links.
- `style.css`: light editorial sections and a dark material showcase. Keep
  sections unframed, screenshots proportional and mobile text unclipped.
- `translations.js`: shared existing catalogs plus explicit nine-language
  supplemental strings. Keep visible text, accessibility labels and screenshots
  in the same language; migrate the old `zh` preference to `zh-Hant`.
- `site.js`: presentation-only tabs and image selection. No calculator engine,
  app data or hidden network integration. Long translated words fit their heading
  container rather than breaking the product name or using viewport font scaling.
- `assets/<locale>/`: actual renders of the current App, not generated concepts.
  `calculator`/`smoked`/`pearl` are glass-off; the `*-glass` variants are glass-on.
  Keep UI text and hit targets unaltered in these renders.
- `privacy.html`: existing policy source; legal claims are not rewritten as part
  of product-page styling or translation work.

## Capture And Verify

```powershell
$env:NODE_PATH='C:/Users/yogal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node capture.cjs
node verify.cjs
```

`capture.cjs` serves the App temporarily, captures 13 views per language and
closes its server/browser. It only changes isolated browser-local preferences.
These are real web-UI renders, not proof of installation or native-device testing.

`verify.cjs` checks nine phone/tablet/desktop viewports, nine languages, all
feature tabs, all six theme/glass combinations, image decoding, localized alt
text, header/hero bounds, long titles, keyboard tab navigation, persisted language,
legacy preference migration and blocked-storage fallback. Screenshots/reports go
outside this repository to `../apple_calculator_apk/test-artifacts/website-20261025`.

After verification, commit/push only this website repository. Confirm deployed
HTML and assets match the commit before calling the public update complete.

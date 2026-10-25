# Calculator Website

Buildless nine-language product website. Open `index.html` locally; no server,
framework, analytics, remote fonts or runtime library is required.

GitHub Pages serves the `main` branch root at
https://yogaliu0818.github.io/calculator-website/ . Preserve this repository,
public URL and audience; do not create a duplicate hosting project for a redesign.
The Android App is maintained separately in `../apple_calculator_apk/www`.

## Architecture

- `index.html`: single-product hero, three-step expression-editing story,
  feature tabs, dedicated scientific/conversion/Explore sections, three-theme material close-up, tablet showcase,
  native FAQ disclosures, complete footer and Play download links.
- `style.css`: light editorial sections and a dark material showcase. Keep
  sections unframed, screenshots proportional and mobile text unclipped.
- `translations.js`: shared existing catalogs plus explicit nine-language
  supplemental strings. Keep visible text, accessibility labels and screenshots
  in the same language; migrate the old `zh` preference to `zh-Hant`.
- `studio-copy.js`: nine-language editorial, story and FAQ catalogs. Every
  locale must cover every key; no silent English fallback for visible copy.
- `site.js`: presentation-only tabs and image selection. No calculator engine,
  app data or hidden network integration. Long translated words fit their heading
  container rather than breaking the product name or using viewport font scaling.
  First-visit language follows browser preferences, not IP geolocation. A manual
  language choice takes priority and is persisted; automatic selection is not.
  Unsupported preferences fall back to English. No geolocation service is called.
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
node audit-responsive-media.cjs
node audit-language-detection.cjs
```

`capture.cjs` serves the App temporarily, captures 13 views per language and
closes its server/browser. It only changes isolated browser-local preferences.
These are real web-UI renders, not proof of installation or native-device testing.

`node capture-details.cjs` additionally captures real inline number selection,
correction (245 x 1.08 -> 250 x 1.08 = 270), resulting history, six theme/keypad
details and a scientific glass hero in each language. It uses a 2x pixel density,
not AI-generated screens, visual filters or manipulated calculation results.

`node capture-sections.cjs` captures the complete hero keypad/result region and
dedicated conversion/Explore screens in all nine languages. The hero scales with
object-fit containment; never mask screenshot content or use negative offsets to
fit it. The media audit checks actual painted image bounds, not only containers,
at 14 viewport sizes and 1.25x pixel density. The language audit covers region and
script variants, ordered preferences, manual persistence and blocked storage.

`verify.cjs` checks nine phone/tablet/desktop viewports, nine languages, all
feature tabs, all six theme/glass combinations, image decoding, localized alt
text, header/hero bounds, long titles, keyboard tab navigation, persisted language,
legacy preference migration and blocked-storage fallback. Screenshots/reports go
outside this repository to `../apple_calculator_apk/test-artifacts/website-studio-20261025`.

The current matrix additionally checks story controls, all FAQ open/close states,
keyboard story selection and reduced-motion behavior. The site stays buildless
and works through file://; no always-running development server is required.

After verification, commit/push only this website repository. Confirm deployed
HTML and assets match the commit before calling the public update complete.

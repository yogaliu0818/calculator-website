# Website Decisions

## 2026-10-14: Localization And Tablets

- Keep product copy and real app screenshots in matching language directories:
  en, zh-Hant, zh-Hans, ja, ko, fr, de, es, pt-BR.
- Preserve older `zh` preference by migrating it to zh-Hant. Default to English.
- Screenshot capture uses the real app, sample history, and the same orange
  accent across themes. It changes browser-local preferences, not app source.
- Tablet showcase includes actual 800x1280 and 1280x800 app renders. Website
  checks also cover 600x960 and 960x600 layouts, plus phones and desktop.
- Treat native/legal privacy text as its own source; do not change legal claims
  as part of product-page translations.

## 2026-10-25: Product Website Redesign

- User approved the Apple-inspired presentation direction, not an embedded
  calculator demo. Preserve the existing GitHub Pages URL and public audience.
- Light product hero uses actual App screenshots; dark appearance section has
  three distinct theme choices and a real glass-on/off screenshot switch.
  Feature tabs reuse localized copy and matching calculator/history/Explore/
  converter images. Scientific and tablet sections stay separate.
- Recaptured 13 App views for each of nine locales (117 images), including
  portrait scientific and three glass variants. Only isolated browser-local App
  state changed; no Android source, release version, APK or AAB modification.
- Preserve translation parity for text, alt labels, dropdown/group names and
  images. German long product names need measured container-based fitting;
  checking document overflow alone missed the ugly split word in the first pass.
- All capture/test browsers and temporary servers close themselves. This is
  website QA, not native installation or physical-device proof.
- Final nine-size/nine-language matrix passed 3350 assertions. Glass previews
  are different captured states, not a CSS filter on one screenshot. Versioned
  asset URLs avoid mixing the new page with cached scripts and old captures.

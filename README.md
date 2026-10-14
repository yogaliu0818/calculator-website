# Calculator Website

Buildless nine-language product website. Open index.html locally.
Actual screenshots are copied from calculator regression artifacts; no conceptual
UI screenshots. No analytics, remote fonts or runtime libraries.

GitHub Pages deploys the main branch root. App source is maintained separately.

`translations.js` contains complete page catalogs. `capture.cjs` captures localized
screenshots from the real app for all nine languages, with populated sample history
and tablet views. It does not change app source. `verify.cjs` tests six phone,
tablet and desktop sizes, translated labels, image decoding and persistent choice.

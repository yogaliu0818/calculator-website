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
- Implementation commit: 93957dc. GitHub remote main remained 0a84bcd after
  push: Git Credential Manager requires fresh authentication, and the connected
  GitHub tool was unavailable. Cancelled the owned waiting Git processes; a
  noninteractive retry confirmed missing authentication. No public deployment
  completed. Do not claim the public URL contains this redesign yet.

## 2026-10-25: Studio-Level Product Presentation

- User approved direction A and explicitly asked to continue. Replaced the
  three-screenshot hero with one full-bleed real App product scene, responsive
  desktop/scientific and phone views. No fabricated features, ratings or users.
- The editing story captures actual selection of 245, correction to 250 and
  250 x 1.08 = 270, followed by real history. Three steps support keyboard input.
  Feature tabs, theme/glass controls and tablet views remain available.
- Material close-ups show actual keypad captures for six theme/glass states.
  `capture-details.cjs` creates 11 images per language at 2x pixel density,
  including consistent mobile/landscape heroes. App code/data is unchanged.
- Added native FAQ disclosures, grouped footer, skip link, local Lucide icons,
  reduced-motion-safe transitions and truthful SoftwareApplication metadata.
  `studio-copy.js` covers all 31 new strings in all nine languages.
- Heading fitting uses word segmentation so Chinese/Japanese can wrap naturally
  while long Western words fit without clipping. Mobile hero hides the clipped
  top icon; its footnote is hidden so it cannot overlap the visible keypad.
- Expanded browser matrix: 5710 assertions passed across nine languages and
  nine viewports, including all story/theme/FAQ states and keyboard controls.
  Twenty-seven material on/off pairs were checked for actual pixel differences.
- QA artifacts: ../apple_calculator_apk/test-artifacts/website-studio-20261025/.
  Public publishing status is separate; GitHub authentication was previously
  unavailable. Keep the existing repository/Pages URL rather than duplicating it.
- Final source smoke passed another 148 checks across four sizes and all nine
  languages after the responsive hero update. Native FAQ Enter toggling and
  matching localized picture sources were checked; final phone/tablet/desktop
  screenshots were visually inspected. No servers are left running.
- Publication unblocked: noninteractive Git push succeeded for 8d592be; Pages
  workflow 40179345241 completed successfully. Public HTML/CSS/JS and sampled
  localized image SHA-256 hashes match local source. Live-browser checks passed
  13 assertions without JS/HTTP errors. Extra breakpoint matrix passed 126.
- Public URL now serves this studio redesign. Older authentication-blocked
  entries above are historical, not the current publication status.

## 2026-10-25: Screenshot Containment And Automatic Language

- User-visible hero clipping escaped the previous container-only checks. Removed
  fixed image heights, negative offsets and clip-path masks. Use object-fit:
  contain; portrait uses a real focus capture with expression, result and all
  five keypad rows. Landscape uses the complete scientific keyboard. Story and
  feature screenshots also retain their full height.
- Scientific, conversion and Explore now have dedicated explanations and real
  localized screenshots. Added four editorial keys (35 total) in nine languages.
  capture-sections.cjs creates three images per locale without changing App code.
- Automatic language uses browser language preferences, not IP: supported-region
  variants are normalized, explicit Chinese scripts win over region, unsupported
  languages fall back to English. Manual selection wins and persists. Automatic
  selection is not stored as if manually chosen; legacy zh remains Traditional.
- No external IP/geolocation/translation request is made. Language regression
  audit passed 116 checks including blocked storage and manual-choice reload.
- Full regression explicitly sets en-US for its blocked-storage fallback case;
  machine browser language is not guaranteed to be English anymore.
- Final full matrix passed 5710 assertions; painted-media audit passed 1638
  assertions across 14 sizes and nine locales. Phone Explore and tablet conversion
  captures were visually inspected. Current cache suffix is 20261025c.
- Implementation 9ec7840 deployed successfully in Pages workflow 40180799239.
  Live verification passed 60 checks; normalized text-source hashes and exact
  sampled PNG hashes match. Public language detection/manual persistence tested.

## 2026-10-25: Real Product Demonstration And Compact Mobile Proof

- User approved the improvement recommendations. The hero now cycles through
  actual 245 selection, correction to 250 and 250 x 1.08 = 270, about six seconds.
  Reuses the App's real handlers only during isolated screenshot capture; the
  website does not embed or duplicate the calculator engine.
- Animation has manual pause/step buttons and stops offscreen, in background
  tabs, during a full-screen image dialog and under reduced-motion preferences.
  Capture frames are WebP quality 88, reducing 24.17 MB of source PNGs to 2.94 MB
  across all nine locales and both orientations. A visitor loads only their
  language/orientation frames; other full-screen images remain lazy.
- Mobile story, conversion, Explore and feature-tab previews use intentional
  detail captures rather than long shrunk screenshots. A native dialog shows
  the matching complete image, traps focus, supports Escape and restores focus
  and page scrolling when closed. Never use clip masks on the hero product.
- Added actual 180 cm -> 1.8 m and area 100 -> radius approximately 5.6419 cases.
  Case numbers, dates, labels and accessibility text follow the selected locale.
  Editorial catalog now has 50 strings in all nine locales.
- Download assurance is beside the primary CTA. Version highlights reference
  local 1.0.8 release notes, prepared 2026-10-24, not a verified Play release date.
- capture-proof.cjs is the last capture step because older scripts contain old
  examples. Tests ignore the intentionally unloaded closed-dialog image and wait
  for the asynchronous hero's decoded frame before measuring its painted bounds.
- QA caught insufficient hero space in short landscape; compact only the copy
  in that orientation so the complete scientific keypad remains visible.
- Final browser suites passed: 5710 existing regression assertions, 1895 new
  product-proof assertions, 1638 painted-media assertions and 116 automatic
  language assertions. Phone hero/dialog and phone/tablet feature sections were
  visually inspected. Cache suffix for this candidate is 20261025d.

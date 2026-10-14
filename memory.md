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

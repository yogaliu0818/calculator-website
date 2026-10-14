const language = document.querySelector('#language');
function setLanguage(value) {
  const lang = value === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-en]').forEach(element => {
    element.textContent = element.dataset[lang];
  });
  document.title = lang === 'zh' ? '計算機 — 計算、修正、探索' : 'Calculator — Calculate. Refine. Explore.';
  language.value = lang;
  try { localStorage.setItem('site-language', lang); } catch {}
}
let saved = 'en';
try { saved = localStorage.getItem('site-language') || 'en'; } catch {}
setLanguage(saved);
language.addEventListener('change', () => setLanguage(language.value));

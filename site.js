const language = document.querySelector('#language');
const languages = {en:'English','zh-Hant':'繁體中文','zh-Hans':'简体中文',ja:'日本語',ko:'한국어',fr:'Français',de:'Deutsch',es:'Español','pt-BR':'Português (Brasil)'};
language.replaceChildren(...Object.entries(languages).map(([value, label]) => new Option(label, value)));
const originals = [...document.querySelectorAll('[data-en]')];
const catalogs = {en:Object.fromEntries(siteKeys.map(k => [k,k])), 'zh-Hant':Object.fromEntries(originals.map(e => [e.dataset.en,e.dataset.zh]))};
Object.assign(catalogs['zh-Hant'], {'ROOM TO THINK':'留出思考空間','At home on your tablet.':'在平板上，同樣從容。','Designed for phones and tablets, in portrait and landscape. More space for the same familiar tools.':'支援手機和平板的直向與橫向排版，在更大的螢幕上使用熟悉的工具。',Portrait:'直向',Landscape:'橫向',Language:'語言'});
for (const [lang,text] of Object.entries(siteTranslations)) {
  const values = text.split('|');
  if (values.length !== siteKeys.length) throw new Error(`Incomplete translation: ${lang}`);
  catalogs[lang] = Object.fromEntries(siteKeys.map((key,index) => [key,values[index]]));
}
document.querySelectorAll('img:not(.brand img)').forEach(img => {
  img.dataset.shot = img.getAttribute('src').split('/').pop().replace('.png','');
});
function setLanguage(value) {
  const lang = value === 'zh' ? 'zh-Hant' : Object.hasOwn(languages,value) ? value : 'en';
  const catalog = catalogs[lang];
  document.documentElement.lang = lang;
  originals.forEach(element => { element.textContent = catalog[element.dataset.en]; });
  document.title = catalog.Calculator;
  document.querySelector('meta[name="description"]').content = catalog[siteKeys[9]];
  language.setAttribute('aria-label',catalog.Language);
  document.querySelectorAll('img[data-shot]').forEach(img => {
    img.src = `assets/${lang}/${img.dataset.shot}.png`;
    const labels = {calculator:'A focused calculator',scientific:'Rotate your device. A scientific calculator is already there.',history:'History worth keeping',explore:'Explore the possibilities',converters:'Different units. One place.',smoked:'Smoked',pearl:'Pearl','tablet-portrait':'Portrait','tablet-landscape':'Landscape'};
    img.alt = `${catalog.Calculator} — ${catalog[labels[img.dataset.shot]]}`;
  });
  language.value = lang;
  try { localStorage.setItem('site-language', lang); } catch {}
}
let saved = 'en';
try { saved = localStorage.getItem('site-language') || 'en'; } catch {}
setLanguage(saved);
language.addEventListener('change', () => setLanguage(language.value));

(() => {
  'use strict';
  const language=document.querySelector('#language');
  const languages={en:'English','zh-Hant':'繁體中文','zh-Hans':'简体中文',ja:'日本語',ko:'한국어',fr:'Français',de:'Deutsch',es:'Español','pt-BR':'Português (Brasil)'};
  const catalogs={en:Object.fromEntries(siteKeys.map(key=>[key,key])),'zh-Hant':Object.fromEntries(siteKeys.map((key,i)=>[key,siteTraditional[i]]))};
  for(const [lang,text] of Object.entries(siteTranslations)){
    const values=text.split('|');if(values.length!==siteKeys.length)throw new Error(`Incomplete translation: ${lang}`);
    catalogs[lang]=Object.fromEntries(siteKeys.map((key,i)=>[key,values[i]]));
  }
  for(const [lang,values]of Object.entries(siteExtras)){
    if(values.length!==extraKeys.length)throw new Error(`Incomplete extras: ${lang}`);
    Object.assign(catalogs[lang],Object.fromEntries(extraKeys.map((key,i)=>[key,values[i]])));
  }
  for(const [lang,values]of Object.entries(studioCopy)){
    if(values.length!==studioKeys.length)throw new Error(`Incomplete studio copy: ${lang}`);
    Object.assign(catalogs[lang],Object.fromEntries(studioKeys.map((key,i)=>[key,values[i]])));
  }
  language.replaceChildren(...Object.entries(languages).map(([value,label])=>new Option(label,value)));
  const features={calculator:['A focused calculator','Editable expressions, scientific functions, and clear error explanations.'],history:['History worth keeping','Review, copy, revise, and reuse previous calculations.'],explore:['Explore the possibilities','Interactive formulas, reverse calculations, and scenario comparisons.'],converters:['Different units. One place.','Convert length, area, weight, temperature, energy, pressure, and more. Currency conversion keeps saved rates available offline.']};
  let current='en',theme='classic';
  function translate(key){if(!Object.hasOwn(catalogs[current],key))throw new Error(`Missing ${current}: ${key}`);return catalogs[current][key];}
  const textMeasure=document.createElement('canvas').getContext('2d');
  function fitHeadings(){
    // Fit the longest word, not the viewport; translated names must not split.
    document.querySelectorAll('h1,h2,h3').forEach(element=>{
      element.style.fontSize='';const style=getComputedStyle(element);
      textMeasure.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const words=element.tagName==='H1'?[element.textContent]
        :typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(current,{granularity:'word'}).segment(element.textContent)].filter(part=>part.isWordLike).map(part=>part.segment)
        :element.textContent.split(/\s+/);
      if(!words.length)return;
      const widest=Math.max(...words.map(word=>textMeasure.measureText(word).width));
      if(widest>element.clientWidth)element.style.fontSize=`${Math.floor(parseFloat(style.fontSize)*(element.clientWidth-2)/widest)}px`;
    });
  }
  function updateText(){document.querySelectorAll('[data-copy]').forEach(element=>{element.textContent=translate(element.dataset.copy);});fitHeadings();}
  function updateImages(){
    document.querySelectorAll('img[data-shot]').forEach(img=>{
      const next=`assets/${current}/${img.dataset.shot}.png?v=20261025c`;
      if(img.getAttribute('src')!==next){
        img.classList.remove('shot-changing');
        img.onload=()=>{img.classList.remove('shot-changing');requestAnimationFrame(()=>img.classList.add('shot-changing'));};
        img.src=next;
      }
      if(!img.closest('[aria-hidden="true"]')){
        const names={'classic-glass':'Liquid Glass','smoked-glass':'Liquid Glass','pearl-glass':'Liquid Glass',smoked:'Smoked',pearl:'Pearl',scientific:'Scientific calculator','scientific-glass':'Scientific calculator','tablet-portrait':'Portrait','tablet-landscape':'Landscape','story-edit':'Select the number.','story-result':'Keep the answer clear.','story-history':'Pick up where you left off.','conversion-detail':'Different units. One place.','explore-detail':'Explore the possibilities'};
        img.alt=translate(names[img.dataset.shot]||(img.dataset.shot.includes('-keys')?'Appearance':features[img.dataset.shot]?.[0])||'Calculator');
      }
    });
    document.querySelectorAll('source[data-source-shot]').forEach(source=>{source.srcset=`assets/${current}/${source.dataset.sourceShot}.png?v=20261025c`;});
  }
  function setLanguage(value,persist=false){
    current=value==='zh'?'zh-Hant':Object.hasOwn(languages,value)?value:'en';document.documentElement.lang=current;updateText();updateImages();language.value=current;
    document.title=translate('Calculator');document.querySelector('meta[name="description"]').content=translate(siteKeys[9]);
    document.querySelector('meta[property="og:title"]').content=translate('Calculator');document.querySelector('meta[property="og:description"]').content=translate(siteKeys[4]);
    document.querySelector('meta[property="og:image"]').content=`https://yogaliu0818.github.io/calculator-website/assets/${current}/scientific-glass.png`;
    language.setAttribute('aria-label',translate('Language'));document.querySelectorAll('nav,.product-facts').forEach(e=>e.setAttribute('aria-label',translate('Calculator')));
    document.querySelectorAll('[role="tablist"]').forEach(e=>e.setAttribute('aria-label',translate('Features')));document.querySelector('.theme-options').setAttribute('aria-label',translate('Appearance'));
    if(persist)try{localStorage.setItem('site-language',current);}catch{}
  }
  function selectFeature(button,focus=false){
    const feature=button.dataset.feature;
    for(const item of document.querySelectorAll('[data-feature]')){const selected=item===button;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;}
    document.querySelector('#feature-panel').setAttribute('aria-labelledby',button.id);document.querySelector('#feature-image').dataset.shot=feature;
    document.querySelector('#feature-title').dataset.copy=features[feature][0];document.querySelector('#feature-description').dataset.copy=features[feature][1];
    document.querySelector('#feature-number').textContent=`0${Object.keys(features).indexOf(feature)+1} / 04`;
    document.querySelector('#feature-note').hidden=feature!=='converters';updateText();updateImages();if(focus)button.focus();
  }
  function updateAppearance(){
    const glass=document.querySelector('#glass-toggle').checked;
    document.querySelector('#appearance-image').dataset.shot=glass?`${theme}-glass`:theme==='classic'?'calculator':theme;
    document.querySelector('#material-image').dataset.shot=`${theme}-keys${glass?'-glass':''}`;
    document.querySelector('.material-stage').dataset.previewTheme=theme;document.querySelector('#preview-theme-label').dataset.copy={classic:'Classic',smoked:'Smoked',pearl:'Pearl'}[theme];
    document.querySelector('#glass-status').dataset.copy=glass?'Glass on':'Glass off';document.querySelectorAll('[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===theme)));updateText();updateImages();
  }
  document.querySelectorAll('[data-feature]').forEach(button=>{
    button.addEventListener('click',()=>selectFeature(button));button.addEventListener('keydown',event=>{
      const tabs=[...document.querySelectorAll('[data-feature]')],i=tabs.indexOf(button),next={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if(next!==undefined){event.preventDefault();selectFeature(tabs[next],true);}
    });
  });
  document.querySelectorAll('[data-story]').forEach(button=>{
    function select(){
      document.querySelectorAll('[data-story]').forEach(item=>{const active=item===button;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
      document.querySelector('#story-panel').setAttribute('aria-labelledby',button.id);
      document.querySelector('#story-image').dataset.shot=`story-${button.dataset.story}`;
      document.querySelector('.story-equation').hidden=button.dataset.story!=='edit';updateImages();
    }
    button.addEventListener('click',select);
    button.addEventListener('keydown',event=>{
      const tabs=[...document.querySelectorAll('[data-story]')],i=tabs.indexOf(button);
      const next={ArrowDown:(i+1)%tabs.length,ArrowUp:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if(next!==undefined){event.preventDefault();tabs[next].click();tabs[next].focus();}
    });
  });
  document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{theme=button.dataset.theme;updateAppearance();}));
  document.querySelector('#glass-toggle').addEventListener('change',updateAppearance);language.addEventListener('change',()=>setLanguage(language.value,true));
  function preferredLanguage(){
    for(const tag of navigator.languages?.length?navigator.languages:[navigator.language]){
      const normalized=String(tag||'').toLowerCase().replaceAll('_','-');
      if(normalized==='zh'||normalized.startsWith('zh-')){
        if(/(?:^|-)hans(?:-|$)/.test(normalized))return 'zh-Hans';
        return /(?:^|-)hant(?:-|$)|(?:^|-)(?:tw|hk|mo)(?:-|$)/.test(normalized)?'zh-Hant':'zh-Hans';
      }
      const base=normalized.split('-')[0];
      if(base==='pt')return 'pt-BR';
      if(Object.hasOwn(languages,base))return base;
    }
    return 'en';
  }
  let saved=null;try{saved=localStorage.getItem('site-language');}catch{}
  const validSaved=saved==='zh'||Object.hasOwn(languages,saved);
  setLanguage(validSaved?saved:preferredLanguage(),saved==='zh');
  let lastWidth=0;
  new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==lastWidth){lastWidth=width;fitHeadings();}}).observe(document.body);
})();

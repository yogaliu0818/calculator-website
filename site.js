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
      if(!element.clientWidth)return;
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
      const shot=img.id==='feature-image'?{calculator:'story-result',history:'story-history',explore:'explore-detail',converters:'conversion-detail'}[img.dataset.shot]:img.dataset.shot;
      const next=`assets/${current}/${shot}.png?v=20261025d`;
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
    document.querySelectorAll('source[data-detail-for]').forEach(source=>{
      const img=document.getElementById(source.dataset.detailFor),shot=img.dataset.shot;
      const detail=img.id==='feature-image'?{calculator:'story-result-detail',history:'story-history-detail',explore:'explore-focus',converters:'conversion-focus'}[shot]:shot.startsWith('story-')?shot+'-detail':shot.replace('-detail','-focus');
      source.srcset=`assets/${current}/${detail}.png?v=20261025d`;
    });
  }
  function setLanguage(value,persist=false){
    current=value==='zh'?'zh-Hant':Object.hasOwn(languages,value)?value:'en';document.documentElement.lang=current;updateText();updateImages();language.value=current;
    document.title=translate('Calculator');document.querySelector('meta[name="description"]').content=translate(siteKeys[9]);
    document.querySelector('meta[property="og:title"]').content=translate('Calculator');document.querySelector('meta[property="og:description"]').content=translate(siteKeys[4]);
    document.querySelector('meta[property="og:image"]').content=`https://yogaliu0818.github.io/calculator-website/assets/${current}/scientific-glass.png`;
    language.setAttribute('aria-label',translate('Language'));document.querySelectorAll('nav,.product-facts').forEach(e=>e.setAttribute('aria-label',translate('Calculator')));
    document.querySelectorAll('[role="tablist"]').forEach(e=>e.setAttribute('aria-label',translate('Features')));document.querySelector('.theme-options').setAttribute('aria-label',translate('Appearance'));
    document.querySelector('.release time').textContent=new Intl.DateTimeFormat(current,{dateStyle:'long',timeZone:'UTC'}).format(new Date('2026-10-24T12:00:00Z'));
    const number=new Intl.NumberFormat(current,{maximumFractionDigits:4});
    document.querySelector('#conversion .case-example strong').innerHTML=`180 <small>cm</small><span>→</span>${number.format(1.8)} <small>m</small>`;
    document.querySelector('#explore .case-example strong').innerHTML=`A = 100<span>→</span>r ≈ ${number.format(5.6419)}`;
    document.querySelector('.demo-controls').setAttribute('aria-label',translate('Calculation preview'));
    document.querySelectorAll('[data-demo-step]').forEach((button,i)=>button.setAttribute('aria-label',translate(['Select the number.','Change the number.','Keep the answer clear.'][i])));
    const close=document.querySelector('#preview-close');close.title=translate('Close');close.setAttribute('aria-label',close.title);
    demoStep=0;showDemoStep();
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
  document.querySelector('[data-install-notes]').addEventListener('click',()=>{document.querySelector('#apk-install').open=true;});
  const motion=matchMedia('(prefers-reduced-motion:reduce)'),portrait=matchMedia('(max-width:700px) and (orientation:portrait)');
  const heroImage=document.querySelector('#hero-image'),heroSource=document.querySelector('[data-demo-source]'),toggle=document.querySelector('#demo-toggle');
  const frames=['select','correct','result'],equations=['245 × 1.08','250 × 1.08','250 × 1.08 = 270'];
  let demoStep=0,demoPaused=false,demoVisible=false,demoTimer=0,demoRequest=0;
  const decodedFrames=new Map();
  function preloadFrame(step){
    const url=`assets/${current}/demo-${portrait.matches?'':'wide-'}${frames[step]}.webp?v=20261025d`;
    if(!decodedFrames.has(url)){
      const image=new Image();image.decoding='async';image.src=url;
      decodedFrames.set(url,image.decode().catch(error=>{decodedFrames.delete(url);throw error;}));
    }
    return decodedFrames.get(url);
  }
  function updateDemoControl(){
    const paused=demoPaused||motion.matches,label=translate(paused?'Play preview':'Pause preview');
    toggle.title=label;toggle.setAttribute('aria-label',label);toggle.disabled=motion.matches;
    toggle.querySelector('img').src=`assets/icons/${paused?'play':'pause'}.svg`;
    document.querySelectorAll('[data-demo-step]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===demoStep)));
  }
  function scheduleDemo(){
    clearTimeout(demoTimer);
    if(!demoPaused&&!motion.matches&&demoVisible&&!document.hidden&&!document.querySelector('#screen-preview').open){
      demoTimer=setTimeout(()=>{demoStep=(demoStep+1)%frames.length;showDemoStep();},2000);
    }
  }
  async function showDemoStep(){
    const request=++demoRequest;heroImage.dataset.ready='false';clearTimeout(demoTimer);updateDemoControl();
    try{await preloadFrame(demoStep);}catch{if(request===demoRequest){demoPaused=true;updateDemoControl();}return;}
    if(request!==demoRequest)return;
    heroImage.src=`assets/${current}/demo-wide-${frames[demoStep]}.webp?v=20261025d`;
    heroSource.srcset=`assets/${current}/demo-${frames[demoStep]}.webp?v=20261025d`;
    heroImage.alt=translate(['Select the number.','Change the number.','Keep the answer clear.'][demoStep]);
    document.querySelector('#demo-equation').textContent=equations[demoStep];
    try{await heroImage.decode();}catch{return;}
    if(request!==demoRequest)return;heroImage.dataset.ready='true';
    if(!motion.matches&&demoVisible&&!demoPaused)preloadFrame((demoStep+1)%frames.length).catch(()=>{});
    scheduleDemo();
  }
  toggle.addEventListener('click',()=>{demoPaused=!demoPaused;updateDemoControl();scheduleDemo();});
  document.querySelectorAll('[data-demo-step]').forEach(button=>button.addEventListener('click',()=>{demoStep=Number(button.dataset.demoStep);showDemoStep();}));
  new IntersectionObserver(entries=>{demoVisible=entries[0].isIntersecting;scheduleDemo();},{threshold:.15}).observe(document.querySelector('.hero-stage'));
  document.addEventListener('visibilitychange',scheduleDemo);
  motion.addEventListener('change',()=>{updateDemoControl();scheduleDemo();});
  portrait.addEventListener('change',()=>showDemoStep());
  const preview=document.querySelector('#screen-preview'),previewImage=document.querySelector('#preview-image');
  document.querySelectorAll('[data-preview-target]').forEach(button=>button.addEventListener('click',()=>{
    const image=document.getElementById(button.dataset.previewTarget);previewImage.src=image.src;previewImage.alt=image.alt;
    preview.showModal();document.documentElement.classList.add('preview-open');clearTimeout(demoTimer);
  }));
  document.querySelector('#preview-close').addEventListener('click',()=>preview.close());
  preview.addEventListener('click',event=>{if(event.target===preview){const box=preview.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)preview.close();}});
  preview.addEventListener('close',()=>{document.documentElement.classList.remove('preview-open');previewImage.removeAttribute('src');scheduleDemo();});
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

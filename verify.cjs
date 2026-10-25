const {chromium}=require('playwright');
const path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const output=path.resolve(__dirname,'../apple_calculator_apk/test-artifacts/website-20261025');
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;
  const locales=['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR'];
  async function decoded(page){await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';await img.decode();}});}
  try{
    for(const [width,height]of [[320,568],[390,844],[600,960],[960,600],[800,1280],[1280,800],[1440,900],[1920,1080],[852,393]]){
      const page=await browser.newPage({viewport:{width,height}}),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      for(const lang of locales){
        await page.selectOption('#language',lang);await decoded(page);
        const result=await page.evaluate(()=>{
          const r=e=>e.getBoundingClientRect(),brand=r(document.querySelector('.brand')),nav=r(document.querySelector('nav'));
          const hero=r(document.querySelector('.hero')),copy=r(document.querySelector('.hero-copy')),image=r(document.querySelector('.hero-center'));
          return {lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+1,
            empty:[...document.querySelectorAll('[data-copy]')].some(e=>!e.textContent.trim()||e.textContent==='undefined'),
            wrong:[...document.querySelectorAll('img[data-shot]')].some(e=>!e.src.includes('/'+document.documentElement.lang+'/')),
            headerOverlap:brand.right>nav.left,heroOverlap:copy.bottom>image.top,heroVisible:image.top<hero.bottom,
            title:document.title,allLoaded:[...document.images].every(e=>e.naturalWidth>0),
            textOverflow:[...document.querySelectorAll('button,a,select')].filter(e=>e.getClientRects().length).some(e=>e.scrollWidth>e.clientWidth+2),
            heroBottom:hero.bottom,titleOneLine:r(document.querySelector('h1')).height<=parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight)+1};
        });
        assert.equal(result.lang,lang);assert(!result.overflow,`overflow ${width}/${lang}`);assert(!result.empty);assert(!result.wrong);
        assert(!result.headerOverlap,`header ${width}/${lang}`);assert(!result.heroOverlap,`hero overlap ${width}/${lang}`);
        assert(result.heroVisible,`hero missing ${width}/${lang}`);assert(result.allLoaded);assert(!result.textOverflow,`text clipped ${width}/${lang}`);
        assert(result.titleOneLine,`broken product name ${width}/${lang}`);assert.equal(errors.length,0,errors.join('\n'));checks+=11;
        for(const name of ['calculator','history','explore','converters']){
          await page.locator(`[data-feature="${name}"]`).click();await decoded(page);
          assert.equal(await page.locator('#feature-image').getAttribute('data-shot'),name);
          assert.equal(await page.locator('[data-feature][aria-selected="true"]').count(),1);
          assert.equal(await page.locator('#feature-panel').getAttribute('aria-labelledby'),`tab-${name}`);checks+=3;
        }
        for(const theme of ['classic','smoked','pearl'])for(const glass of [false,true]){
          await page.locator(`[data-theme="${theme}"]`).click();await page.locator('#glass-toggle').setChecked(glass);await decoded(page);
          assert.equal(await page.locator('#appearance-image').getAttribute('data-shot'),glass?`${theme}-glass`:theme==='classic'?'calculator':theme);
          assert.equal(await page.locator('[data-theme][aria-pressed="true"]').count(),1);
          assert.equal(await page.locator('#glass-toggle').isChecked(),glass);checks+=3;
        }
        if(['en','zh-Hant','de'].includes(lang)&&[390,800,1440].includes(width)){
          await page.locator('[data-feature="calculator"]').click();await page.locator('[data-theme="classic"]').click();
          await page.locator('#glass-toggle').setChecked(true);await page.evaluate(()=>scrollTo(0,0));await decoded(page);
          await page.screenshot({path:path.join(output,`${width}-${lang}.png`),fullPage:true});
          if(lang==='en')await page.screenshot({path:path.join(output,`${width}-hero.png`)});
        }
      }
      await page.reload();assert.equal(await page.locator('#language').inputValue(),'pt-BR');checks++;
      await page.selectOption('#language','en');await page.locator('[data-feature="calculator"]').focus();
      await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-feature="history"]').getAttribute('aria-selected'),'true');checks++;
      await page.keyboard.press('End');assert.equal(await page.locator('[data-feature="converters"]').getAttribute('aria-selected'),'true');checks++;
      await page.close();
    }
    // Legacy preferences and rejected storage access must not prevent rendering.
    for(const mode of ['legacy','blocked']){
      const page=await browser.newPage();
      await page.addInitScript(mode=>{if(mode==='legacy')localStorage.setItem('site-language','zh');else{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};}},mode);
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      assert.equal(await page.locator('html').getAttribute('lang'),mode==='legacy'?'zh-Hant':'en');checks++;await page.close();
    }
    const report={passed:checks,failed:0,locales:9,viewports:9,output};
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(report);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

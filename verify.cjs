const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  let checks=0;
  try {
    for(const [width,height] of [[320,568],[390,844],[600,960],[960,600],[800,1280],[1280,800],[1440,900]]){
      const page=await browser.newPage({viewport:{width,height}});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
        await page.selectOption('#language',lang);
        await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';await img.decode();}});
        const result=await page.evaluate(()=>({
          lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,
          empty:[...document.querySelectorAll('[data-en]')].some(e=>!e.textContent.trim()),
          wrong:[...document.querySelectorAll('img[data-shot]')].some(img=>!img.src.includes('/'+document.documentElement.lang+'/')),
          headerOverlap:(()=>{const brand=document.querySelector('.brand').getBoundingClientRect(),nav=document.querySelector('nav').getBoundingClientRect();return brand.right>nav.left;})()
        }));
        assert.equal(result.lang,lang);assert(!result.overflow,`overflow ${width}/${lang}`);
        assert(!result.empty);assert(!result.wrong);assert(!result.headerOverlap,`header ${width}/${lang}`);
        assert.equal(errors.length,0,errors.join('\n'));checks+=6;
        if(['en','de','ja'].includes(lang)&&[390,800,1280].includes(width)){
          await page.screenshot({path:path.join(__dirname,'../',`website-check-${width}-${lang}.png`),fullPage:true});
        }
      }
      await page.reload();assert.equal(await page.locator('#language').inputValue(),'pt-BR');checks++;
      await page.close();
    }
    console.log({passed:checks,failed:0});
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const out=path.resolve(__dirname,'../apple_calculator_apk/test-artifacts/website-proof-20261025');
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;
  try{
    for(const [width,height]of [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[852,393]]){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
      page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
        await page.selectOption('#language',lang);
        for(const [index,step]of ['select','correct','result'].entries()){
          await page.locator(`[data-demo-step="${index}"]`).click();
          await page.waitForFunction(({lang,step})=>document.querySelector('#hero-image').dataset.ready==='true'&&document.querySelector('#hero-image').src.includes('/'+lang+'/')&&document.querySelector('#hero-image').src.includes(step),{lang,step});
          await page.locator('#hero-image').evaluate(img=>img.decode());
          assert.equal(await page.locator('[data-demo-step][aria-pressed="true"]').count(),1);
          assert((await page.locator('#demo-equation').textContent()).includes(index===0?'245':'250'));
          assert(await page.locator('#demo-toggle').isDisabled());checks+=3;
        }
        for(const id of ['story-image','feature-image','conversion-image','explore-image']){
          const button=page.locator(`[data-preview-target="${id}"]`);
          await button.click();await page.locator('#preview-image').evaluate(img=>img.decode());
          assert.equal(await page.locator('#screen-preview').evaluate(e=>e.open),true);
          assert.equal(await page.locator('#preview-image').evaluate(e=>e.src),await page.locator('#'+id).evaluate(e=>e.src));
          assert(await page.locator('html').evaluate(e=>e.classList.contains('preview-open')));
          if(id==='story-image')await page.keyboard.press('Escape');else await page.locator('#preview-close').click();
          assert.equal(await page.locator('#screen-preview').evaluate(e=>e.open),false);
          assert.equal(await button.evaluate(e=>document.activeElement===e),true);
          assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('preview-open')),false);checks+=6;
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
        assert.equal(errors.length,0,errors.join('\n'));checks+=2;
        if(lang==='zh-Hant'&&[390,768,1440].includes(width)){
          await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,`${width}-hero.png`)});
          for(const id of ['features','conversion','explore'])await page.locator('#'+id).screenshot({path:path.join(out,`${width}-${id}.png`)});
        }
      }
      await page.close();console.log('Proof checks',width,height);
    }
    const page=await browser.newPage({viewport:{width:390,height:844},locale:'en-US'});
    await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await page.waitForTimeout(2500);
    assert.equal(await page.locator('[data-demo-step="1"]').getAttribute('aria-pressed'),'true');checks++;
    await page.locator('#demo-toggle').click();const paused=await page.locator('#hero-image').getAttribute('src');
    await page.waitForTimeout(2300);assert.equal(await page.locator('#hero-image').getAttribute('src'),paused);checks++;
    await page.locator('#demo-toggle').click();await page.waitForTimeout(2300);assert.notEqual(await page.locator('#hero-image').getAttribute('src'),paused);checks++;
    await page.locator('#explore').scrollIntoViewIfNeeded();await page.waitForTimeout(300);const offscreen=await page.locator('#hero-image').getAttribute('src');
    await page.waitForTimeout(2300);assert.equal(await page.locator('#hero-image').getAttribute('src'),offscreen);checks++;
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);const reduced=await page.locator('#hero-image').getAttribute('src');
    await page.waitForTimeout(2300);assert.equal(await page.locator('#hero-image').getAttribute('src'),reduced);checks++;
    await page.close();
    const report={checks,errors:[],locales:9,viewports:6};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(report);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

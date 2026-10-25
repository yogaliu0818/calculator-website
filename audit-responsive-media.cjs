const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const out=path.resolve(__dirname,'../apple_calculator_apk/test-artifacts/website-media-fix-20261025');
const sizes=[[320,568],[360,640],[390,844],[640,600],[700,640],[701,640],[720,640],[768,1024],[800,1280],[820,600],[1024,768],[1280,800],[1440,900],[852,393]];
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;
  try{
    for(const [width,height]of sizes){
      const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1.25,reducedMotion:'reduce'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
        await page.selectOption('#language',lang);
        await page.waitForFunction(()=>document.querySelector('#hero-image').dataset.ready==='true');
        await page.evaluate(async()=>{for(const img of document.images){if(!img.hasAttribute('src'))continue;img.loading='eager';try{await img.decode();}catch{throw Error('Cannot decode '+img.currentSrc);}}});
        const result=await page.evaluate(()=>{
          const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
          const img=document.querySelector('.hero-center'),stage=document.querySelector('.hero-stage');
          const bounds=box(img),scale=Math.min(bounds.width/img.naturalWidth,bounds.height/img.naturalHeight);
          const painted={left:bounds.left+(bounds.width-img.naturalWidth*scale)/2,top:bounds.top+(bounds.height-img.naturalHeight*scale)/2,width:img.naturalWidth*scale,height:img.naturalHeight*scale};
          painted.right=painted.left+painted.width;painted.bottom=painted.top+painted.height;
          const previews=['.story-visual .app-screen','.feature-visual .app-screen','#conversion .app-screen','#explore .app-screen'].map(selector=>{const e=document.querySelector(selector);return {selector,image:box(e),parent:box(e.parentElement)};});
          return {stage:box(stage),image:bounds,painted,copy:box(document.querySelector('.hero-copy')),hero:box(document.querySelector('.hero')),clip:getComputedStyle(img).clipPath,overflow:document.documentElement.scrollWidth>innerWidth+1,previews};
        });
        const label=`${width}x${height}/${lang}`;
        assert.equal(result.clip,'none',`Masked screenshot ${label}`);checks++;
        for(const side of ['left','right','top','bottom']){
          const lower=side==='left'||side==='top';
          assert(lower?result.painted[side]>=result.stage[side]-1:result.painted[side]<=result.stage[side]+1,`Clipped hero ${side} ${label}: ${JSON.stringify(result)}`);checks++;
        }
        assert(result.stage.top>=result.copy.bottom+7,`CTA collision ${label}`);assert(result.painted.height>=70,`Product too small ${label}`);assert(!result.overflow,`Overflow ${label}`);checks+=3;
        for(const preview of result.previews){assert(preview.image.top>=preview.parent.top-1&&preview.image.bottom<=preview.parent.bottom+1,`Clipped ${preview.selector} ${label}`);checks++;}
        assert.equal(errors.length,0,errors.join('\n'));checks++;
        if(['en','zh-Hant'].includes(lang)&&[390,640,720,768,800,1440].includes(width)){
          await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:path.join(out,`${width}x${height}-${lang}.png`)});
          if([390,768].includes(width)&&lang==='zh-Hant')for(const section of ['conversion','explore']){
            await page.locator('#'+section).screenshot({path:path.join(out,`${width}-${section}-${lang}.png`)});
          }
        }
      }
      await page.close();console.log('Checked',width,height);
    }
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,viewports:sizes.length,languages:9,errors:[]},null,2));console.log({checks,errors:[]});
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base='https://yogaliu0818.github.io/calculator-website/';
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
(async()=>{
  let checks=0;
  for(const file of ['index.html','style.css','site.js','studio-copy.js','translations.js','assets/en/hero-focus.png','assets/zh-Hant/explore-detail.png','assets/de/conversion-detail.png']){
    const response=await fetch(new URL(file+'?verify=20261025c',base));
    assert.equal(response.status,200,file);
    const actual=Buffer.from(await response.arrayBuffer()),expected=fs.readFileSync(path.join(__dirname,file));
    // Git checkout line endings are not a publication difference.
    const normalize=data=>file.endsWith('.png')?data:Buffer.from(data.toString('utf8').replaceAll('\r\n','\n'));
    assert.equal(hash(normalize(actual)),hash(normalize(expected)),file);checks+=2;
  }
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const [locale,expected,width,height]of [['zh-TW','zh-Hant',390,844],['zh-CN','zh-Hans',800,1280],['en-US','en',1440,900],['de-DE','de',852,393]]){
      const context=await browser.newContext({locale,viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
      await page.goto(base+'?v=20261025c');
      assert.equal(await page.locator('html').getAttribute('lang'),expected);
      assert.equal(await page.locator('#language').inputValue(),expected);
      assert.equal(await page.evaluate(()=>localStorage.getItem('site-language')),null);checks+=3;
      for(const id of ['conversion','explore']){
        assert((await page.locator('#'+id+' h2').textContent()).trim());
        assert((await page.locator('#'+id+' img').getAttribute('src')).includes('/'+expected+'/'));checks+=2;
      }
      await page.selectOption('#language','ja');await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'),'ja');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);checks+=4;
      await context.close();
    }
  }finally{await browser.close();}
  console.log({checks,errors:[],url:base,normalizedSourceHashesMatch:true,noExternalGeolocation:true});
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;
  try{
    const cases=[
      [['zh-TW'],'zh-Hant'],[['zh-HK'],'zh-Hant'],[['zh-MO'],'zh-Hant'],[['zh-Hant-CN'],'zh-Hant'],
      [['zh-CN'],'zh-Hans'],[['zh-SG'],'zh-Hans'],[['zh-Hans-HK'],'zh-Hans'],[['zh'],'zh-Hans'],
      [['en-GB'],'en'],[['ja-JP'],'ja'],[['ko-KR'],'ko'],[['fr-CA'],'fr'],[['de-AT'],'de'],
      [['es-MX'],'es'],[['pt-PT'],'pt-BR'],[['pt-BR'],'pt-BR'],[['it-IT','fr-FR','en-US'],'fr'],
      [['it-IT','ar-EG'],'en'],[['en-US','zh-TW'],'en']
    ];
    for(const [languages,expected]of cases){
      const context=await browser.newContext({reducedMotion:'reduce'});
      await context.addInitScript(languages=>Object.defineProperty(navigator,'languages',{get:()=>languages}),languages);
      const page=await context.newPage(),errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
      await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      assert.equal(await page.locator('html').getAttribute('lang'),expected,languages.join(','));
      assert.equal(await page.locator('#language').inputValue(),expected);
      assert.equal(await page.evaluate(()=>localStorage.getItem('site-language')),null,'Automatic detection must not create a manual preference');
      assert.equal(errors.length,0,errors.join('\n'));assert.deepEqual(external,[],'No IP/geolocation or translation request');checks+=5;
      await page.selectOption('#language','ja');await page.reload();assert.equal(await page.locator('#language').inputValue(),'ja');checks++;
      await context.close();
    }
    for(const blocked of [false,true]){
      const context=await browser.newContext({locale:'de-DE',reducedMotion:'reduce'});
      await context.addInitScript(blocked=>{
        if(blocked){Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};}
        else localStorage.setItem('site-language','zh');
      },blocked);
      const page=await context.newPage();await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
      assert.equal(await page.locator('html').getAttribute('lang'),blocked?'de':'zh-Hant');checks++;
      await context.close();
    }
    console.log({checks,errors:[],noExternalGeolocation:true});
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

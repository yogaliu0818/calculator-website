const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'../apple_calculator_apk/www');
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]));
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
      const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:2});
      await page.addInitScript(()=>localStorage.setItem('calculator-language-selected-v1','1'));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.waitForFunction(()=>window.CalculatorExperience);
      const out=path.join(__dirname,'assets',lang);fs.mkdirSync(out,{recursive:true});
      await page.evaluate(lang=>{
        changeLanguage(lang);CalculatorExperience.setPortraitScientific(false);
        appSettings.liquidGlass=false;applyVisualSettings();resetAll();
        for(const digit of '245')inputDigit(digit);chooseOperator('multiply');
        inputDigit('1');inputDecimal();inputDigit('0');inputDigit('8');updateDisplay();
      },lang);
      // Capture the real inline selection and its actual correction, not a mock overlay.
      await page.locator('#displayText [data-formula-start="0"]').click();
      await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'story-edit.png')});
      for(const digit of '250')await page.locator(`.basic-keys [data-number="${digit}"]`).click();
      await page.locator('.basic-keys [data-action="equals"]').click();
      const result=await page.locator('#displayText').textContent();
      if(result!=='270')throw Error(`Unexpected story result ${lang}: ${result}`);
      await page.screenshot({path:path.join(out,'story-result.png')});
      await page.evaluate(()=>openHistorySheet());await page.waitForTimeout(300);
      await page.screenshot({path:path.join(out,'story-history.png')});
      await page.evaluate(()=>closeHistorySheet());
      for(const theme of ['classic','smoked','pearl']){
        await page.evaluate(()=>{openSettingsView();document.querySelector('.ex-appearance').open=true;});
        await page.locator(`button[data-theme="${theme}"]`).click();
        await page.evaluate(()=>closeSettingsView());
        for(const glass of [false,true]){
          await page.evaluate(glass=>{appSettings.liquidGlass=glass;applyVisualSettings();},glass);
          await page.waitForTimeout(350);
          await page.locator('.basic-keys').screenshot({path:path.join(out,`${theme}-keys${glass?'-glass':''}.png`)});
        }
      }
      await page.evaluate(()=>{openSettingsView();document.querySelector('.ex-appearance').open=true;});
      await page.locator('button[data-theme="classic"]').click();
      await page.evaluate(()=>{closeSettingsView();appSettings.liquidGlass=true;applyVisualSettings();});
      await page.waitForTimeout(350);await page.screenshot({path:path.join(out,'hero-mobile.png')});
      await page.setViewportSize({width:1100,height:500});await page.waitForTimeout(350);
      await page.screenshot({path:path.join(out,'scientific-glass.png')});
      await page.close();console.log('Captured details',lang);
    }
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'../apple_calculator_apk/www');
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url==='/'?'index.html':req.url.split('?')[0]));
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
      const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:2});
      await page.addInitScript(()=>localStorage.setItem('calculator-language-selected-v1','1'));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.CalculatorExperience);
      await page.evaluate(lang=>{
        changeLanguage(lang);CalculatorExperience.setPortraitScientific(false);resetAll();
        for(const c of '250')inputDigit(c);chooseOperator('multiply');inputDigit('1');inputDecimal();inputDigit('0');inputDigit('8');performEquals();updateDisplay();
        appSettings.liquidGlass=true;applyVisualSettings();
      },lang);
      const out=path.join(__dirname,'assets',lang);await page.waitForTimeout(350);
      // Intentional detail view: retain the complete display, all five key rows
      // and bottom padding; remove only the unused top area of the App capture.
      await page.screenshot({path:path.join(out,'hero-focus.png'),clip:{x:0,y:200,width:393,height:652}});
      await page.evaluate(()=>{appSettings.liquidGlass=false;applyVisualSettings();openConverterView();openConverter('length');});
      await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'conversion-detail.png')});
      await page.evaluate(()=>{closeConverterView();CalculatorExperience.openExplore('circle');});
      await page.locator('[data-field="radius"]').click();await page.locator('[data-ex-key="clear"]').click();await page.locator('[data-ex-key="5"]').click();
      await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'explore-detail.png')});
      await page.close();console.log('Captured feature sections',lang);
    }
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

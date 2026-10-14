const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname,'../apple_calculator_apk/www');
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  const file = path.join(root,req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    for (const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']) {
      const page = await browser.newPage({viewport:{width:393,height:852}});
      await page.addInitScript(()=>localStorage.setItem('calculator-language-selected-v1','1'));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.waitForFunction(()=>window.CalculatorExperience);
      await page.evaluate(lang=>{changeLanguage(lang);saveHistory('1442 ÷ 8','180.25');saveHistory('125 + 75','200');openSettingsView();},lang);
      await page.evaluate(()=>document.querySelector('.ex-appearance').open=true);
      await page.locator('[data-accent="orange"]').click();
      await page.locator('button[data-theme="classic"]').click();
      await page.evaluate(()=>closeSettingsView());
      const out=path.join(__dirname,'assets',lang);fs.mkdirSync(out,{recursive:true});
      async function shot(name,width=393,height=852){await page.setViewportSize({width,height});await page.waitForTimeout(160);await page.screenshot({path:path.join(out,name+'.png')});}
      await shot('calculator');await shot('scientific',852,393);
      await page.setViewportSize({width:393,height:852});
      await page.evaluate(()=>openHistorySheet());await shot('history');
      await page.evaluate(()=>{closeHistorySheet();CalculatorExperience.openExplore('');});await shot('explore');
      await page.evaluate(()=>{document.querySelector('.ex-page').hidden=true;openConverterView();});await shot('converters');
      await page.evaluate(()=>{closeConverterView();openSettingsView();});
      await page.evaluate(()=>document.querySelector('.ex-appearance').open=true);
      for(const theme of ['smoked','pearl']){
        await page.locator(`button[data-theme="${theme}"]`).click();
        await page.evaluate(()=>closeSettingsView());await shot(theme);
        await page.evaluate(()=>{openSettingsView();document.querySelector('.ex-appearance').open=true;});
      }
      await page.locator('button[data-theme="classic"]').click();await page.evaluate(()=>closeSettingsView());
      await shot('tablet-portrait',800,1280);await shot('tablet-landscape',1280,800);
      console.log('Captured',lang,'9 screenshots');await page.close();
    }
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});

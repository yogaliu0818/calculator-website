const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'../apple_calculator_apk/www');
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]));
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
      const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:2});
      await page.addInitScript(()=>localStorage.setItem('calculator-language-selected-v1','1'));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.CalculatorExperience);
      const out=path.join(__dirname,'assets',lang);
      for(const wide of [false,true]){
        await page.setViewportSize(wide?{width:1100,height:500}:{width:393,height:852});
        await page.evaluate(lang=>{
          changeLanguage(lang);CalculatorExperience.setPortraitScientific(false);appSettings.liquidGlass=true;applyVisualSettings();resetAll();
          for(const c of '245')inputDigit(c);chooseOperator('multiply');inputDigit('1');inputDecimal();inputDigit('0');inputDigit('8');updateDisplay();
        },lang);
        await page.locator('#displayText [data-formula-start="0"]').click();
        for(const step of ['select','correct','result']){
          if(step==='correct')for(const c of '250')await page.locator(`${wide?'.scientific-keys':'.basic-keys'} [data-number="${c}"]`).click();
          if(step==='result')await page.locator(`${wide?'.scientific-keys':'.basic-keys'} [data-action="equals"]`).click();
          await page.waitForTimeout(350);
          if(step==='result'&&(await page.locator('#displayText').textContent())!=='270')throw Error(`Invalid result: ${lang}`);
          const frame=await page.screenshot(!wide?{clip:{x:0,y:200,width:393,height:652}}:{});
          await sharp(frame).webp({quality:88,effort:6}).toFile(path.join(out,`demo-${wide?'wide-':''}${step}.webp`));
          if(!wide&&step!=='correct'){
            await page.screenshot({path:path.join(out,`story-${step==='select'?'edit':step==='result'?'result':'correct'}.png`)});
            const display=await page.locator('#display').boundingBox(),preview=await page.locator('#expressionPreview').boundingBox();
            const y=Math.floor(Math.min(display.y,preview.y)-15),bottom=Math.ceil(display.y+display.height-12);
            await page.screenshot({path:path.join(out,`story-${step==='select'?'edit':step==='result'?'result':'correct'}-detail.png`),clip:{x:16,y,width:361,height:bottom-y}});
          }
        }
      }
      await page.setViewportSize({width:393,height:852});
      await page.evaluate(()=>{appSettings.liquidGlass=false;applyVisualSettings();openHistorySheet();});await page.waitForTimeout(350);
      await page.screenshot({path:path.join(out,'story-history.png')});
      await page.locator('.history-item').first().screenshot({path:path.join(out,'story-history-detail.png')});
      await page.evaluate(()=>{closeHistorySheet();openConverterView();openConverter('length');});
      await page.selectOption('#converterFrom','cm');await page.selectOption('#converterTo','m');
      await page.evaluate(()=>{const field=document.querySelector('#converterAmount');field.value='180';field.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.waitForTimeout(200);
      if(!(await page.locator('#converterResult').textContent()).replace(',','.').startsWith('1.8'))throw Error('Invalid conversion');
      await page.screenshot({path:path.join(out,'conversion-detail.png')});
      await page.locator('.converter-card').screenshot({path:path.join(out,'conversion-focus.png')});
      await page.evaluate(()=>{closeConverterView();CalculatorExperience.openExplore('circle');});
      await page.locator('[data-mode="reverse"]').click();await page.waitForTimeout(250);
      const result=await page.locator('.ex-answer strong').textContent();if(!result.replace(',','.').startsWith('5.6418'))throw Error(`Invalid inverse ${result}`);
      await page.screenshot({path:path.join(out,'explore-detail.png')});
      const answer=await page.locator('.ex-answer').boundingBox(),modes=await page.locator('.ex-modes').boundingBox(),canvas=await page.locator('.ex-canvas').boundingBox();
      const top=Math.floor(modes.y),bottom=Math.ceil(canvas.y+canvas.height+8);
      await page.screenshot({path:path.join(out,'explore-focus.png'),clip:{x:16,y:top,width:361,height:bottom-top}});
      await page.close();console.log('Captured proof',lang);
    }
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});

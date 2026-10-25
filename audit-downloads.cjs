const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const root=__dirname,artifact='calculator-1.0.8-v9.apk';
const digest=buffer=>crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
const expected=digest(fs.readFileSync(path.join(root,'../play-console-assets/releases',artifact)));
const server=http.createServer((req,res)=>{
  let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
  if(file===root)file=path.join(root,'index.html');
  const relative=path.relative(root,file);
  if(relative.startsWith('..')||relative.split(path.sep).some(part=>part.startsWith('.'))||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404).end();return;}
  const type=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.apk':'application/vnd.android.package-archive'})[type]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
(async()=>{
  assert.equal(digest(fs.readFileSync(path.join(root,'downloads',artifact))),expected);
  assert(fs.readFileSync(path.join(root,'downloads',artifact.replace('.apk','.sha256.txt')),'utf8').startsWith(expected));let checks=2;
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    for(const [width,height]of [[320,568],[390,844],[600,960],[768,1024],[1024,768],[1440,900],[852,393]]){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',acceptDownloads:true}),errors=[];
      page.on('pageerror',error=>errors.push(error.message));await page.goto(`http://127.0.0.1:${server.address().port}/`);
      for(const lang of ['en','zh-Hant','zh-Hans','ja','ko','fr','de','es','pt-BR']){
        await page.selectOption('#language',lang);await page.waitForFunction(()=>document.querySelector('#hero-image').dataset.ready==='true');
        const layout=await page.evaluate(()=>{
          const a=document.querySelector('.download-apk'),b=document.querySelector('.download-store'),x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
          return {correctOrder:innerWidth<=480?x.bottom<=y.top:x.right<=y.left,clip:[a,b].some(e=>e.scrollWidth>e.clientWidth+2),overflow:document.documentElement.scrollWidth>innerWidth+1};
        });
        assert(layout.correctOrder,`CTA order ${width}/${lang}`);assert(!layout.clip,`CTA clipping ${width}/${lang}`);assert(!layout.overflow);checks+=3;
        await page.locator('[data-install-notes]').click();assert(await page.locator('#apk-install').evaluate(e=>e.open));
        assert(await page.locator('#apk-install p').isVisible());assert.equal(errors.length,0,errors.join('\n'));checks+=3;
        await page.locator('#apk-install').evaluate(e=>e.open=false);
      }
      const currentUrl=page.url(),waiting=page.waitForEvent('download');await page.locator('.download-apk').click();const download=await waiting;
      assert.equal(download.suggestedFilename(),artifact);assert.equal(digest(fs.readFileSync(await download.path())),expected);assert.equal(page.url(),currentUrl);checks+=3;
      await page.close();console.log('Download checks',width,height);
    }
    console.log({checks,errors:[],apkSha256:expected});
  }finally{await browser.close();server.close();}
})().catch(error=>{server.close();console.error(error);process.exitCode=1;});

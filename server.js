const express=require('express');
const path=require('path');
const {cleanHtml,layout,documentCss}=require('./lib/document-export');
const app=express();
const PORT=process.env.PORT||3000;
app.use(express.json({limit:'20mb'}));
app.use(express.static(path.join(__dirname,'public')));
function requestDocument(req,res){
  if(typeof req.body?.html!=='string'||req.body.html.length>20*1024*1024){res.status(400).send('Provide document HTML under 20 MB.');return null;}
  const filename=String(req.body.filename||'Document').replace(/[^\p{L}\p{N}_\- ]/gu,'_').slice(0,160)||'Document';
  return {html:cleanHtml(req.body.html),header:cleanHtml(req.body.headerHtml||''),footer:cleanHtml(req.body.footerHtml||''),settings:layout(req.body.layout),filename};
}
app.post('/api/export/docx',async(req,res)=>{
  const doc=requestDocument(req,res);if(!doc)return;
  try{
    const HTMLtoDOCX=require('html-to-docx'),mmToTwip=mm=>Math.round(mm/25.4*1440),settings=doc.settings;
    const buffer=await HTMLtoDOCX(doc.html||'<p></p>',doc.header||null,{
      title:doc.filename,creator:'WebEditor',font:'Arial',fontSize:24,lang:'en-US',
      orientation:settings.width>settings.height?'landscape':'portrait',
      pageSize:{width:mmToTwip(Math.min(settings.width,settings.height)),height:mmToTwip(Math.max(settings.width,settings.height))},
      margins:{...Object.fromEntries(Object.entries(settings.margins).map(([edge,value])=>[edge,mmToTwip(value)])),header:360,footer:360,gutter:0},
      header:!!doc.header,footer:!!doc.footer,pageNumber:/class=["'][^"']*pageNumber/.test(doc.footer),table:{row:{cantSplit:true}},
    },doc.footer||null);
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition',`attachment; filename="${encodeURIComponent(doc.filename)}.docx"`);res.send(Buffer.from(buffer));
  }catch(error){console.error('DOCX export:',error.message);res.status(500).send('Word export failed. Save HTML to preserve a copy, then try again.');}
});
app.post('/api/export/pdf',async(req,res)=>{
  const doc=requestDocument(req,res);if(!doc)return;let browser;
  try{
    browser=await require('puppeteer').launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
    const page=await browser.newPage();await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);page.on('request',request=>/^data:/i.test(request.url())?request.continue():request.abort());
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${documentCss}</style></head><body>${doc.html}</body></html>`,{waitUntil:'load',timeout:15000});
    const hf=html=>`<style>*{font:9pt Arial,sans-serif;margin:0;color:#444}</style><div style="width:100%;padding:0 ${doc.settings.margins.right}mm 0 ${doc.settings.margins.left}mm">${html}</div>`;
    const buffer=await page.pdf({width:doc.settings.width+'mm',height:doc.settings.height+'mm',printBackground:true,displayHeaderFooter:!!(doc.header||doc.footer),headerTemplate:doc.header?hf(doc.header):'<div></div>',footerTemplate:doc.footer?hf(doc.footer):'<div></div>',margin:Object.fromEntries(Object.entries(doc.settings.margins).map(([edge,value])=>[edge,value+'mm']))});
    res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${encodeURIComponent(doc.filename)}.pdf"`);res.end(Buffer.from(buffer));
  }catch(error){console.error('PDF export:',error.message);res.status(500).send('PDF export failed. Use Print to save as PDF, or save HTML.');}
  finally{if(browser)await browser.close();}
});
if(require.main===module)app.listen(PORT,()=>console.log(`WebEditor running at http://localhost:${PORT}`));
module.exports=app;

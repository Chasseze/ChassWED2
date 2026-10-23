const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const acorn=require('acorn');
const root=path.join(__dirname,'..');
function environment(){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'public/index.html'),'utf8'),{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.DOMPurify=require('dompurify')(w);w.indexedDB=new IDBFactory();w.matchMedia=()=>({matches:false});w.ResizeObserver=class{observe(){}disconnect(){}};Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent;},set(value){this.textContent=value;}});w.document.execCommand=()=>true;w.document.queryCommandState=()=>false;w.HTMLElement.prototype.scrollIntoView=()=>{};
  const modules=['templates','commands','storage','layout','exports','workspace'].map(name=>fs.readFileSync(path.join(root,'public/editor',name+'.js'),'utf8')).join('\n');
  const source=fs.readFileSync(path.join(root,'public/main.js'),'utf8');const cls=acorn.parse(source,{ecmaVersion:'latest'}).body.find(n=>n.type==='ClassDeclaration');
  w.eval(modules+'\n'+source.slice(cls.start,cls.end)+'\nwindow.CharlesWebEditor=CharlesWebEditor;window.WebEditorCommands=WebEditorCommands;window.EditorLayout=EditorLayout;');
  w.eval('window.WebEditorCommands=WebEditorCommands;window.EditorLayout=EditorLayout;');
  const app=new w.CharlesWebEditor();w.charlesEditor=app;
  return {dom,w,app,close:()=>dom.window.close()};
}
test('replace-all preserves surrounding rich content and undo/redo',async()=>{
  const e=environment();try{const {app,w}=e;await app.storage.initialize();
  app.commands.change(()=>app.editor.innerHTML='<h1>Title</h1><p><strong>cat</strong> and cat</p><table><tr><td>untouched</td></tr></table>');
  w.document.getElementById('replaceFindInput').value='cat';w.document.getElementById('replaceInput').value='$& dog';app.replaceAll();
  assert.equal(app.editor.querySelector('h1').textContent,'Title');assert.equal(app.editor.querySelector('strong').textContent,'$& dog');assert.equal(app.editor.querySelector('td').textContent,'untouched');
  app.undo();assert.equal(app.editor.querySelector('strong').textContent,'cat');app.redo();assert.equal(app.editor.querySelector('strong').textContent,'$& dog');
  }finally{e.close();}
});
test('browser recovery restores documents, layout, headers, and current tab',async()=>{
 const e=environment();try{const {app,w}=e;await app.storage.initialize();
 app.commands.change(()=>{app.editor.innerHTML='<h2>Recovered work</h2>';app.currentDoc.layout={size:'letter',orientation:'landscape',top:20,right:21,bottom:22,left:23};w.document.getElementById('pageHeaderContent').innerHTML='<p>Header</p>';});await app.saveDocumentState();
 const first=app.currentDocId;app.addNewDocument();const second=app.currentDocId;app.commands.change(()=>app.editor.innerHTML='<p>Second work</p>');await app.saveDocumentState();
 app.documents={};await app.storage.initialize();assert.equal(app.currentDocId,second);assert.equal(app.editor.textContent,'Second work');app.switchDocument(first);assert.equal(app.editor.textContent,'Recovered work');assert.equal(w.document.getElementById('pageHeaderContent').textContent,'Header');assert.equal(app.currentDoc.layout.orientation,'landscape');
 app.closeDocument(second);assert.equal(app.editor.textContent,'Recovered work');assert(app.storage.records.has(second));
 }finally{e.close();}
});
test('storage failures never delete other documents or claim a successful save',async()=>{
 const e=environment();try{const {app,w}=e;await app.storage.initialize();w.localStorage.setItem('charles_editor_doc_doc-old','keep me');app.storage.ready=Promise.resolve(null);
 const original=w.Storage.prototype.setItem;w.Storage.prototype.setItem=()=>{throw new Error('QuotaExceeded');};
 app.editor.innerHTML='<p>Important edits</p>';assert.equal(await app.saveDocumentState(),false);assert.match(w.document.getElementById('saveStatus').textContent,/failed/);assert.equal(app.hasUnsavedChanges,true);assert.equal(w.localStorage.getItem('charles_editor_doc_doc-old'),'keep me');w.Storage.prototype.setItem=original;
 }finally{e.close();}
});
test('import sanitizes content and preserves the existing document',async()=>{
 const e=environment();try{const {app,w}=e;await app.storage.initialize();app.editor.innerHTML='<p>Original work</p>';const original=app.currentDocId;
 await app.workspace.openFile({name:'Imported.html',size:200,text:async()=>'<html><head><meta name="webeditor-layout" content="{&quot;size&quot;:&quot;legal&quot;}"></head><body><header>Letterhead</header><main><h1>Imported</h1><script>bad()</script><img src="x" onerror="bad()"><a href="javascript:bad()">link</a></main></body></html>'});
 assert.notEqual(app.currentDocId,original);assert.equal(app.editor.querySelector('h1').textContent,'Imported');assert.equal(app.editor.querySelector('script'),null);assert.equal(app.editor.querySelector('img').hasAttribute('onerror'),false);assert.equal(app.editor.querySelector('a').hasAttribute('href'),false);assert.equal(app.currentDoc.layout.size,'legal');assert.equal(w.document.getElementById('pageHeaderContent').textContent,'Letterhead');app.switchDocument(original);assert.equal(app.editor.textContent,'Original work');
 }finally{e.close();}
});
test('Markdown export keeps headings, inline marks, lists and tables once',()=>{
 const e=environment();try{e.app.editor.innerHTML='<h1>Heading</h1><p>Hello <strong>world</strong>.</p><ul><li>One</li><li>Two</li></ul><table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
 const md=e.app.exports.markdown();assert.match(md,/# Heading/);assert.match(md,/Hello \*\*world\*\*\./);assert.match(md,/- One\n- Two/);assert.match(md,/\| A \| B \|/);assert.equal(md.match(/Heading/g).length,1);
 }finally{e.close();}
});
test('legacy recovery migrates safely and IndexedDB still saves when local storage is full',async()=>{
 const e=environment();try{const {app,w}=e;w.localStorage.setItem('charles_editor_doc_doc1','<p>Legacy work</p>');w.localStorage.setItem('charles_editor_doc_doc1_header','Letterhead');await app.storage.initialize();assert.equal(app.editor.textContent,'Legacy work');
 const original=w.Storage.prototype.setItem;w.Storage.prototype.setItem=()=>{throw new Error('QuotaExceeded');};app.editor.innerHTML='<p>Still protected</p>';assert.equal(await app.saveDocumentState(),true);assert.equal(app.hasUnsavedChanges,false);const records=await app.storage.transaction('documents','readonly',store=>store.getAll());assert.match(records[0].content,/Still protected/);w.Storage.prototype.setItem=original;
 }finally{e.close();}
});
test('custom templates are keyboard accessible and survive saving without executing markup in names',async()=>{
 const e=environment();try{const {app,w}=e;await app.storage.initialize();app.templates.push({id:'custom-test',name:'<script>bad()</script>',description:'Saved',content:'<h2>Reusable</h2>',custom:true,icon:'fas fa-file-alt'});app.updateTemplatesList();const buttons=w.document.querySelectorAll('#templatesList button');assert.equal(buttons.length,app.templates.length);assert.equal(w.document.querySelector('#templatesList script'),null);buttons[buttons.length-1].click();assert.equal(app.editor.querySelector('h2').textContent,'Reusable');app.undo();assert.equal(app.editor.querySelector('h2'),null);
 }finally{e.close();}
});
test('export API produces real DOCX and PDF with page geometry and rejects invalid input',async()=>{
 const app=require('../server');const server=app.listen(0);await new Promise(resolve=>server.once('listening',resolve));const url='http://127.0.0.1:'+server.address().port;
 try{const payload={filename:'Review',html:'<h1>Export verification</h1><p><strong>Bold text</strong></p><table><tr><td>Cell content</td></tr></table>',headerHtml:'<p>Letterhead</p>',footerHtml:'<p>Footer</p>',layout:{size:'letter',orientation:'landscape',top:20,right:20,bottom:20,left:20}};
 let response=await fetch(url+'/api/export/docx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(response.status,200);const zip=await require('jszip').loadAsync(await response.arrayBuffer());const docxBytes=await zip.generateAsync({type:'nodebuffer'});const imported=await require('mammoth').convertToHtml({buffer:docxBytes});assert.match(imported.value,/Export verification/);assert.match(imported.value,/Cell content/);const xml=await zip.file('word/document.xml').async('string');assert.match(xml,/Export verification/);assert.match(xml,/Cell content/);assert.match(xml,/w:orient="landscape"/);assert.match(xml,/w:tbl/);assert(zip.file(/word\/header\d+\.xml/).length);
 response=await fetch(url+'/api/export/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(response.status,200);const pdf=Buffer.from(await response.arrayBuffer());assert.equal(pdf.subarray(0,5).toString(),'%PDF-');const box=pdf.toString('latin1').match(/MediaBox\s*\[0 0 ([\d.]+) ([\d.]+)\]/);assert(box);assert(Math.abs(Number(box[1])-792)<1);assert(Math.abs(Number(box[2])-612)<1);
 response=await fetch(url+'/api/export/docx',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,400);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

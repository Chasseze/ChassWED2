class EditorExports {
  constructor(app){this.app=app;}
  payload(){const app=this.app;return {html:WebEditorCommands.sanitize(app.editor.innerHTML),filename:app.currentDoc.name||'Document',headerHtml:app._hfToExportHtml(WebEditorCommands.sanitize(document.getElementById('pageHeaderContent').innerHTML)),footerHtml:app._hfToExportHtml(WebEditorCommands.sanitize(document.getElementById('pageFooterContent').innerHTML)),layout:EditorLayout.normalize(app.currentDoc.layout)};}
  snapshot(){return {id:this.app.currentDocId,name:this.app.currentDoc.name,payload:this.payload(),text:this.app.editor.innerText,markdown:this.markdown()};}
  html(data=this.payload()){const size=[...EditorLayout.sizes[data.layout.size]];if(data.layout.orientation==="landscape")size.reverse();const escape=this.app.escapeHtml;return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="webeditor-layout" content="${escape(JSON.stringify(data.layout))}"><title>${escape(data.filename)}</title><style>body{font:12pt Arial,sans-serif;line-height:1.4;max-width:180mm;margin:24px auto;padding:16px;color:#111}h1{font-size:24pt}h2{font-size:18pt}h3{font-size:14pt}p{margin:0 0 8pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aab3bf;padding:6pt}img{max-width:100%;height:auto}header,footer{font-size:10pt;color:#555;margin:12pt 0}@page{size:${size[0]}mm ${size[1]}mm;margin:${data.layout.top}mm ${data.layout.right}mm ${data.layout.bottom}mm ${data.layout.left}mm}</style></head><body>${data.headerHtml?'<header>'+data.headerHtml+'</header>':''}<main>${data.html}</main>${data.footerHtml?'<footer>'+data.footerHtml+'</footer>':''}</body></html>`;}
  markdown(){
    const container=document.createElement('div');container.innerHTML=WebEditorCommands.sanitize(this.app.editor.innerHTML);
    const walk=node=>{
      if(node.nodeType===3)return node.textContent.replace(/([\\`*_[\]])/g,'\\$1');
      const tag=node.tagName?.toLowerCase();const content=[...node.childNodes].map(walk).join('');
      if(/^h[1-6]$/.test(tag))return '#'.repeat(Number(tag[1]))+' '+content.trim()+'\n\n';
      if(['p','div','section','article'].includes(tag))return content.trim()+'\n\n';
      if(tag==='br')return '\n';if(tag==='strong'||tag==='b')return '**'+content+'**';if(tag==='em'||tag==='i')return '*'+content+'*';if(tag==='code')return '`'+content+'`';
      if(tag==='pre')return '\n```\n'+node.textContent+'\n```\n\n';
      if(tag==='a')return '['+content+']('+node.getAttribute('href')+')';
      if(tag==='img')return '!['+(node.alt||'Image')+']('+node.getAttribute('src')+')';
      if(tag==='li')return (node.parentElement.tagName==='OL'?[...node.parentElement.children].indexOf(node)+1+'. ':'- ')+content.trim()+'\n';
      if(tag==='ul'||tag==='ol')return content+'\n';
      if(tag==='blockquote')return content.trim().split('\n').map(line=>'> '+line).join('\n')+'\n\n';
      if(tag==='table'){const rows=[...node.rows].map(row=>[...row.cells].map(cell=>cell.textContent.replace(/\|/g,'\\|').replace(/\n/g,' ')));if(!rows.length)return '';return rows.map((row,i)=>'| '+row.join(' | ')+' |\n'+(i===0?'| '+row.map(()=>'---').join(' | ')+' |\n':'')).join('')+'\n';}
      return content;
    };
    return [...container.childNodes].map(walk).join('').replace(/\n{3,}/g,'\n\n').trim()+'\n';
  }
  async serverBlob(format,data=this.payload()){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
    try{const response=await fetch('/api/export/'+format,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
      if(!response.ok)throw new Error(await response.text()||'Export failed');
      const expected=format==='pdf'?'application/pdf':'officedocument.wordprocessingml';if(!(response.headers.get('content-type')||'').includes(expected))throw new Error('PDF export needs a running export server. Use Print to save a PDF, or download a Word file instead. This hosting site has no PDF export server configured.');return await response.blob();
    }catch(error){throw new Error(error.name==='AbortError'?'Export took too long. Try Print to PDF or save HTML.':error.message||'Export service unavailable. Run the local server, or save HTML.');}finally{clearTimeout(timeout);}
  }
  async blob(format,snapshot=null){
    const data=snapshot?.payload||this.payload();
    if(format==='docx'){if(!window.WebEditorWord)throw new Error('Word saving has not loaded. Refresh the app and try again.');return WebEditorWord.toBlob(data);}
    if(format==='pdf')return this.serverBlob(format,data);
    if(format==='html')return new Blob([this.html(data)],{type:'text/html;charset=utf-8'});
    if(format==='markdown'||format==='md')return new Blob([snapshot?.markdown??this.markdown()],{type:'text/markdown;charset=utf-8'});
    return new Blob([snapshot?.text??this.app.editor.innerText],{type:'text/plain;charset=utf-8'});
  }
  filename(ext){return (this.app.currentDoc.name||'Document').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').replace(/\.(docx|pdf|html?|md|txt)$/i,'')+'.'+ext;}
  download(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);this.app.showToast('Download prepared: '+name,'success');}
  useFileActions(){return matchMedia('(pointer: coarse)').matches||matchMedia('(max-width: 640px)').matches||(!window.showSaveFilePicker&&typeof navigator.share==='function');}
  preparedFile(blob,name,snapshot){
    const file=new File([blob],name,{type:blob.type}),body=document.createElement('div');
    let shareable=false;try{shareable=!!(navigator.share&&navigator.canShare?.({files:[file]}));}catch(_){}
    const filename=document.createElement('p');filename.className='ready-file-name';filename.textContent=name;
    const instructions=document.createElement('p');instructions.textContent=shareable?'Choose Save / share file to open your phone’s system chooser. Select Save to Files or another location offered by your device. You can also download the file.':'Download the file, then use your browser’s Downloads or Files app to open or move it. Available folders depend on your browser and device.';
    body.append(filename,instructions);
    const actions=[];
    if(shareable)actions.push({label:'Save / share file…',primary:true,run:async modal=>{
      try{await navigator.share({files:[file],title:snapshot.name});modal.classList.remove('active');if(this.app.currentDocId===snapshot.id)this.app.updateSaveStatus('File passed to system chooser');}
      catch(error){if(error.name!=='AbortError')this.app.showToast('The system chooser could not open. Use Download file instead.','warning');}
    }});
    actions.push({label:'Download file',primary:!shareable,run:modal=>{this.download(blob,name);modal.classList.remove('active');if(this.app.currentDocId===snapshot.id)this.app.updateSaveStatus('Download requested');}});
    return this.app.workspace.dialog('Your file is ready',body,actions);
  }
  async export(format){
    const snapshot=this.snapshot(),id=snapshot.id,name=this.filename(format==='markdown'?'md':format);
    this.app.showExportProgress(format.toUpperCase());
    try{const blob=await this.blob(format,snapshot);
      if(this.useFileActions())this.preparedFile(blob,name,snapshot);
      else{this.download(blob,name);if(this.app.currentDocId===id)this.app.updateSaveStatus('Downloaded a copy');}
      return blob;
    }catch(error){this.app.showToast(error.message,'error');throw error;}
    finally{this.app.hideExportProgress();}
  }
}

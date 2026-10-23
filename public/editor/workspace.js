class EditorWorkspace {
  constructor(app){this.app=app;this.analysis=null;this.proposal=null;}
  init(){
    const app=this.app,toolbar=document.querySelector('.toolbar');
    const title=document.getElementById('headerDocumentTitle');
    document.getElementById('closeDocumentBtn').addEventListener('click',()=>app.closeDocument(app.currentDocId));this.syncDocumentClose();
    const documentActions=(x,y)=>{const tab=[...document.querySelectorAll('#documentTabs .tab')].find(tab=>tab.dataset.docId===app.currentDocId);if(tab){app.showTabContextMenu(tab,x,y);document.querySelector('#tabContextMenu button')?.focus();}};
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('tabContextMenu')?.style.display==='block'){app.hideTabContextMenu();title.focus();}});
    title.title='Current document — choose to switch; F2 to rename; right-click for duplicate or close';
    title.addEventListener('contextmenu',event=>{event.preventDefault();documentActions(event.clientX,event.clientY);});
    title.addEventListener('keydown',event=>{if(event.key==='ContextMenu'||event.shiftKey&&event.key==='F10'){event.preventDefault();const rect=title.getBoundingClientRect();documentActions(rect.left,rect.bottom);}});
    const addButton=(id,icon,title,action)=>{const button=document.createElement('button');button.type='button';button.id=id;button.className='toolbar-btn';button.title=title;button.setAttribute('aria-label',title);button.innerHTML=`<i class="fas ${icon}" aria-hidden="true"></i>`;button.addEventListener('click',action);toolbar.append(button);return button;};
    const select=(id,label,options,action)=>{const el=document.createElement('select');el.id=id;el.className='toolbar-select';el.title=label;el.setAttribute('aria-label',label);for(const[value,text]of options)el.add(new Option(text,value));el.addEventListener('change',()=>action(el.value));toolbar.append(el);return el;};
    select('paragraphStyle','Paragraph style',[['normal','Normal'],['heading1','Heading 1'],['heading2','Heading 2'],['heading3','Heading 3'],['quote','Quote'],['code','Code']],value=>app.applyStyle(value));
    select('paragraphLineSpacing','Line spacing',[['1','Single'],['1.15','1.15 lines'],['1.4','1.4 lines'],['1.5','1.5 lines'],['2','Double']],value=>app.applyLineSpacing(value)).value='1.4';
    addButton('justifyFullBtn','fa-align-justify','Justify paragraph',()=>app.executeCommand('justifyFull'));
    addButton('outdentParagraph','fa-outdent','Decrease indent',()=>app.executeCommand('outdent'));
    addButton('indentParagraph','fa-indent','Increase indent',()=>app.executeCommand('indent'));
    addButton('clearTextFormat','fa-eraser','Clear selected text formatting',()=>app.executeCommand('removeFormat'));
    addButton('tableToolsBtn','fa-border-all','Edit selected table',()=>this.tableTools());
    select('workspaceView','Document view',[['auto','Auto view'],['writing','Writing'],['print','Print layout']],value=>app.layout.setView(value));
    addButton('fitWidthBtn','fa-arrows-alt-h','Fit document to available width',()=>app.layout.fit());
    const after=(id,anchor)=>document.getElementById(anchor).after(document.getElementById(id));
    document.getElementById('fontFamily').before(document.getElementById('paragraphStyle'));
    after('clearTextFormat','formatPainterBtn');
    document.querySelector('[data-command="justifyRight"]').after(document.getElementById('justifyFullBtn'));
    document.querySelector('[data-command="insertOrderedList"]').after(document.getElementById('paragraphLineSpacing'));
    after('outdentParagraph','paragraphLineSpacing');after('indentParagraph','outdentParagraph');
    after('tableToolsBtn','insertTableBtn');after('workspaceView','pageSize');after('fitWidthBtn','workspaceView');
    const indicator=document.createElement('span');indicator.id='viewIndicator';indicator.className='view-indicator';document.querySelector('.zoom-control').prepend(indicator);
    const zoom=document.createElement('input');zoom.id='workspaceZoom';zoom.type='range';zoom.min=20;zoom.max=200;zoom.step=5;zoom.setAttribute('aria-label','Document zoom');zoom.addEventListener('input',()=>app.layout.zoom(zoom.value));document.getElementById('zoomPercent').before(zoom);
    for(const root of [app.editor,document.getElementById('pageHeaderContent'),document.getElementById('pageFooterContent')])root.addEventListener('paste',event=>{const html=event.clipboardData?.getData('text/html');if(!html)return;event.preventDefault();app.commands.remember();app.executeCommand('insertHTML',WebEditorCommands.sanitize(html));});
    document.getElementById('editor').setAttribute('role','textbox');app.editor.setAttribute('aria-label','Document content');app.editor.setAttribute('aria-multiline','true');app.editor.spellcheck=true;app.spellCheckEnabled=true;document.getElementById('spellCheckBtn').classList.add('active');
    document.querySelectorAll('button').forEach(button=>{button.type='button';if(button.title&&!button.getAttribute('aria-label'))button.setAttribute('aria-label',button.title);});
    document.querySelectorAll('select,input[type="color"]').forEach(el=>{if(!el.getAttribute('aria-label')&&!document.querySelector(`label[for="${el.id}"]`))el.setAttribute('aria-label',el.title||el.id.replace(/([A-Z])/g,' $1'));});
    document.querySelectorAll('.sidebar-tab').forEach(tab=>{tab.tabIndex=0;tab.setAttribute('role','button');tab.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();app.switchSidebarTab(tab.dataset.tab);}});});
    for(const [id,zone] of [['pageHeaderContent','header'],['pageFooterContent','footer']]){const el=document.getElementById(id);el.addEventListener('input',()=>app.handleEditorInput());el.addEventListener('focus',()=>{if(app.hfEditMode){app.hfActiveZone=zone;app._updateHFLabel(zone);}});}
    document.addEventListener('selectionchange',()=>{app.commands.remember();this.syncFormatting();});
    document.addEventListener('mousedown',event=>{if(event.target.closest('.toolbar,.header-controls,.modal,.sidebar')){app.commands.remember();if(event.target.closest('.toolbar button,.style-btn'))event.preventDefault();}},true);
    document.addEventListener('focusin',event=>{if(event.target.closest('.toolbar,.modal'))app.commands.remember();});
    const resizing=new ResizeObserver(()=>{cancelAnimationFrame(this.resizeFrame);this.resizeFrame=requestAnimationFrame(()=>app.layout.render());});resizing.observe(app.pageContainer);this.resizeObserver=resizing;
    if(matchMedia('(max-width: 640px)').matches)document.getElementById('sidebar').classList.add('collapsed');
    document.querySelectorAll('.export-format-btn,.save-fmt-btn,.style-btn').forEach(el=>{if(el.tagName!=='BUTTON'){el.tabIndex=0;el.setAttribute('role','button');}});
    document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('[role="button"]:not(button):not(.sidebar-tab)')){event.preventDefault();event.target.click();}});
    document.getElementById('toggleSidebarBtn').setAttribute('aria-expanded',!document.getElementById('sidebar').classList.contains('collapsed'));
    const language=WebEditorStorage.get('editor_language')||'en';document.getElementById('languageSelect').value=language;app.changeLanguage(language);
    this.installDialogAccessibility();this.loadCustomTemplates();this.renderHistory();app.updateOutline();app.layout.render();
    document.getElementById('saveStatus').title='Automatic recovery is stored in this browser. Use Save or Export for a file copy.';
  }
  syncDocumentClose(){
    const button=document.getElementById('closeDocumentBtn');if(!button)return;
    button.disabled=Object.keys(this.app.documents).length<2||!!this.app.closingDocuments?.has(this.app.currentDocId);
    button.title=this.app.closingDocuments?.has(this.app.currentDocId)?'Saving before closing…':button.disabled?'Keep at least one document open':'Close '+this.app.currentDoc.name;
    button.setAttribute('aria-label',button.disabled?'Close document — keep at least one open':'Close '+this.app.currentDoc.name);
  }
  syncFormatting(){
    const app=this.app,selection=getSelection();if(!selection.rangeCount||!app.commands.root().contains(selection.anchorNode))return;
    const element=selection.anchorNode.nodeType===3?selection.anchorNode.parentElement:selection.anchorNode,style=getComputedStyle(element);
    document.querySelectorAll('[data-command]').forEach(button=>{try{const active=document.queryCommandState(button.dataset.command);button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);}catch(_){}});
    const block=element.closest('h1,h2,h3,blockquote,pre,p,div'),styleName={H1:'heading1',H2:'heading2',H3:'heading3',BLOCKQUOTE:'quote',PRE:'code'}[block?.tagName]||'normal';
    document.getElementById('paragraphStyle').value=styleName;
    const ratio=parseFloat(style.lineHeight)/parseFloat(style.fontSize),spacing=document.getElementById('paragraphLineSpacing');const option=[...spacing.options].find(option=>Math.abs(Number(option.value)-ratio)<.03);if(option)spacing.value=option.value;
    const family=style.fontFamily.split(',')[0].replace(/["']/g,'').trim(),points=Math.round(parseFloat(style.fontSize)*.75*10)/10;
    const font=document.getElementById('fontFamily'),size=document.getElementById('fontSize');if([...font.options].some(option=>option.value===family))font.value=family;
    if(![...size.options].some(option=>option.value===points+'pt'))size.add(new Option(points,points+'pt'));size.value=points+'pt';
    document.getElementById('currentFont').textContent=`${family}, ${points}pt`;
  }
  installDialogAccessibility(){
    const app=this.app;
    const prepare=modal=>{modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const heading=modal.querySelector('h1,h2,h3,.modal-title');if(heading){heading.id||=modal.id+'Title';modal.setAttribute('aria-labelledby',heading.id);}modal.querySelectorAll('button').forEach(button=>{if(!button.textContent.trim())button.setAttribute('aria-label','Close dialog');});};
    document.querySelectorAll('.modal').forEach(prepare);
    new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'&&record.target.matches('.modal')){const modal=record.target;if(modal.classList.contains('active')){prepare(modal);modal._returnFocus=document.activeElement;requestAnimationFrame(()=>modal.querySelector('input:not([type="hidden"]),textarea,select,button')?.focus());}else if(modal._returnFocus?.isConnected)modal._returnFocus.focus({preventScroll:true});}for(const node of record.addedNodes||[])if(node.nodeType===1&&node.matches('.modal'))prepare(node);}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',event=>{const modal=[...document.querySelectorAll('.modal.active')].at(-1);if(!modal)return;
      if(event.key==='Escape'){event.preventDefault();modal.classList.remove('active');return;}
      if(event.key==='Tab'){const fields=[...modal.querySelectorAll('button,input,textarea,select,a[href],summary')].filter(el=>!el.disabled&&el.getClientRects().length);if(!fields.length)return;if(event.shiftKey&&document.activeElement===fields[0]){event.preventDefault();fields.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===fields.at(-1)){event.preventDefault();fields[0].focus();}}
    });
  }
  dialog(title,body,actions){
    document.getElementById('workspaceDialog')?.remove();
    const modal=document.createElement('div');modal.id='workspaceDialog';modal.className='modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','workspaceDialogTitle');
    const content=document.createElement('div');content.className='modal-content';const header=document.createElement('div');header.className='modal-header';const heading=document.createElement('h3');heading.id='workspaceDialogTitle';heading.textContent=title;
    const close=document.createElement('button');close.className='close-btn';close.textContent='×';close.setAttribute('aria-label','Close dialog');close.addEventListener('click',()=>modal.classList.remove('active'));header.append(heading,close);
    const area=document.createElement('div');area.className='modal-body';if(typeof body==='string')area.innerHTML=body;else area.append(body);
    const footer=document.createElement('div');footer.className='modal-actions';for(const action of actions){const button=document.createElement('button');button.type='button';button.className='btn '+(action.primary?'btn-primary':'btn-secondary');button.textContent=action.label;button.addEventListener('click',()=>action.run(modal,area));footer.append(button);}
    content.append(header,area,footer);modal.append(content);modal.addEventListener('click',event=>{if(event.target===modal)modal.classList.remove('active');});document.body.append(modal);modal.classList.add('active');return modal;
  }
  rename(){
    const app=this.app,id=app.contextMenuDocId||app.currentDocId,doc=app.documents[id];if(!doc)return;
    app.hideTabContextMenu();const modal=this.dialog('Rename document','<label for="documentNameInput">Document title</label><input id="documentNameInput" maxlength="160" />',[{label:'Rename',primary:true,run:(modal,area)=>{const name=area.querySelector('input').value.trim();if(!name)return;doc.name=name;app.storage.rebuildTabs();if(id===app.currentDocId)app.saveDocumentState();else{app.storage.records.set(id,doc);app.storage.transaction('documents','readwrite',store=>store.put(doc)).catch(()=>{});WebEditorStorage.set('webeditor_document_'+id,JSON.stringify(doc));}modal.classList.remove('active');}}]);modal.querySelector('input').value=doc.name;
  }
  renderHistory(){
    const panel=document.getElementById('historyList');if(!panel)return;panel.replaceChildren();
    const doc=this.app.currentDoc;for(let index=doc.history.length-1;index>=0;index--){const button=document.createElement('button');button.className='history-entry'+(index===doc.historyIndex?' active':'');button.textContent=`Revision ${index+1}${index===doc.historyIndex?' · current':''}`;button.addEventListener('click',()=>this.app.commands.restoreHistory(index));panel.append(button);}
  }
  share(){
    const app=this.app;const actions=[{label:'Copy text',run:async()=>{try{await navigator.clipboard.writeText(app.editor.innerText);app.showToast('Document text copied.','success');}catch(_){app.showToast('Clipboard access is unavailable. Select and copy text in the editor.','warning');}}},{label:'Download HTML',primary:true,run:()=>app.exports.export('html').catch(()=>{})}];
    if(navigator.canShare){const file=new File([app.exports.html()],app.exports.filename('html'),{type:'text/html'});if(navigator.canShare({files:[file]}))actions.push({label:'Share file…',run:async()=>{try{await navigator.share({files:[file],title:app.currentDoc.name});}catch(error){if(error.name!=='AbortError')app.showToast('File sharing is unavailable. Download a copy instead.','warning');}}});}
    this.dialog('Send a copy','<p>Copy the text or download a formatted HTML file to send through your preferred app. No public document link is created.</p>',actions);
  }
  insertTable(){this.dialog('Insert table','<div class="field-grid"><label>Rows<input id="tableRowCount" type="number" min="1" max="50" value="3" /></label><label>Columns<input id="tableColumnCount" type="number" min="1" max="20" value="3" /></label></div>',[{label:'Insert table',primary:true,run:(modal,area)=>{const rows=Number(area.querySelector('#tableRowCount').value),columns=Number(area.querySelector('#tableColumnCount').value);if(!Number.isInteger(rows)||!Number.isInteger(columns)||rows<1||rows>50||columns<1||columns>20)return;const table=document.createElement('table');for(let r=0;r<rows;r++){const row=table.insertRow();for(let c=0;c<columns;c++)row.insertCell().innerHTML='<br>';}
      this.app.executeCommand('insertHTML',table.outerHTML+'<p><br></p>');modal.classList.remove('active');}}]);}
  tableTools(){
    const selection=this.app.commands.restore(),node=selection.anchorNode?.nodeType===3?selection.anchorNode.parentElement:selection.anchorNode,cell=node?.closest('td,th'),table=cell?.closest('table');
    if(!table||!this.app.editor.contains(table))return this.app.showToast('Place the cursor in a table cell first.','info');
    const row=cell.parentElement,actions=[];
    const mutate=callback=>modal=>{if(!table.isConnected)return;this.app.commands.change(callback);modal.classList.remove('active');};
    actions.push({label:'Add row below',run:mutate(()=>{if(table.rows.length>=50)return;const inserted=table.insertRow(row.rowIndex+1);for(let i=0;i<row.cells.length;i++)inserted.insertCell().innerHTML='<br>';})});
    actions.push({label:'Add column right',run:mutate(()=>{if(row.cells.length>=20)return;const index=cell.cellIndex+1;[...table.rows].forEach(row=>row.insertCell(Math.min(index,row.cells.length)).innerHTML='<br>');})});
    actions.push({label:'Delete row',run:mutate(()=>{row.remove();if(!table.rows.length)table.remove();})},{label:'Delete column',run:mutate(()=>{const index=cell.cellIndex;[...table.rows].forEach(row=>row.cells[index]?.remove());if(!table.rows[0]?.cells.length)table.remove();})},{label:'Delete table',run:mutate(()=>table.remove())});
    this.dialog('Table tools','<p>Changes affect the table containing your cursor. Undo restores deleted rows, columns, or tables.</p>',actions);
  }
  insertLink(){
    const selected=this.app.commands.restore().toString();const modal=this.dialog('Insert link','<label for="linkAddress">Link address</label><input id="linkAddress" type="url" placeholder="https://example.com" /><label for="linkLabel">Text</label><input id="linkLabel" />',[{label:'Insert link',primary:true,run:(modal,area)=>{const href=area.querySelector('#linkAddress').value.trim();if(!/^(https?:\/\/|mailto:|tel:)/i.test(href))return this.app.showToast('Use an https://, http://, mailto:, or tel: address.','warning');const link=document.createElement('a');link.href=href;link.textContent=area.querySelector('#linkLabel').value||href;link.rel='noopener noreferrer';this.app.executeCommand('insertHTML',link.outerHTML);modal.classList.remove('active');}}]);modal.querySelector('#linkLabel').value=selected;
  }
  templateCards(container){
    if(!container)return;container.replaceChildren();
    for(const template of this.app.templates){const item=document.createElement('button');item.type='button';item.className='template-item';
      const icon=document.createElement('div');icon.className='template-icon';const symbol=document.createElement('i');symbol.className=template.icon;symbol.setAttribute('aria-hidden','true');icon.append(symbol);
      const name=document.createElement('div');name.className='template-name';name.textContent=template.name;const description=document.createElement('div');description.className='template-description';description.textContent=template.description;
      item.append(icon,name,description);item.addEventListener('click',()=>{this.app.applyTemplate(template.id);this.app.hideTemplatesModal();});container.append(item);}
  }
  loadCustomTemplates(){
    const custom=WebEditorStorage.json('webeditor_custom_templates',[]);for(const value of custom)if(/^custom-[\w-]+$/.test(value?.id)&&typeof value.content==='string')this.app.templates.push({id:value.id,name:String(value.name||'Untitled template'),description:'Your saved template',icon:'fas fa-file-alt',custom:true,content:WebEditorCommands.sanitize(value.content)});this.app.updateTemplatesList();
  }
  saveTemplate(){
    const app=this.app;this.dialog('Save template','<label for="templateNameInput">Template name</label><input id="templateNameInput" maxlength="120" />',[{label:'Save template',primary:true,run:(modal,area)=>{const name=area.querySelector('input').value.trim();if(!name)return;app.templates.push({id:'custom-'+crypto.randomUUID(),name,description:'Your saved template',icon:'fas fa-file-alt',content:WebEditorCommands.sanitize(app.editor.innerHTML),custom:true});if(!WebEditorStorage.set('webeditor_custom_templates',JSON.stringify(app.templates.filter(t=>t.custom))))app.showToast('Template is available this session; browser storage could not save it.','warning');app.updateTemplatesList();this.templateManager();modal.classList.remove('active');}}]);
  }
  templateManager(){
    const app=this.app,list=document.getElementById('templateManagerList');list.replaceChildren();
    app.templates.forEach(template=>{const item=document.createElement('div');item.className='template-item';const name=document.createElement('div');name.className='template-item-title';name.textContent=template.name;
      const preview=document.createElement('p'),temp=document.createElement('div');temp.innerHTML=template.content;preview.textContent=temp.textContent.replace(/\s+/g,' ').trim().slice(0,90);preview.className='template-item-preview';
      const use=document.createElement('button');use.className='btn btn-secondary';use.textContent='Use';use.addEventListener('click',()=>{app.applyTemplate(template.id);app.hideTemplateManagerModal();});item.append(name,preview,use);
      if(template.custom){const remove=document.createElement('button');remove.className='btn btn-secondary';remove.textContent='Delete';remove.addEventListener('click',()=>{app.templates=app.templates.filter(t=>t!==template);WebEditorStorage.set('webeditor_custom_templates',JSON.stringify(app.templates.filter(t=>t.custom)));app.updateTemplatesList();this.templateManager();});item.append(remove);}list.append(item);
    });
    document.getElementById('templateManagerModal').classList.add('active');
  }
  async openFile(file){
    const app=this.app,extension=file.name.split('.').pop().toLowerCase();
    if(!['txt','html','htm','docx','md'].includes(extension))return app.showToast('Open a .docx, .html, .md, or .txt file.','warning');
    if(file.size>20*1024*1024)return app.showToast('Choose a document under 20 MB.','warning');
    try{
      let content,headerHtml='',footerHtml='',layout;
      if(extension==='docx'){
        if(typeof mammoth==='undefined')throw new Error('The Word import library has not loaded. Refresh the editor and try again.');
        const result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});content=result.value;
      }else{
        const text=await file.text();
        if(extension==='md')content=app.markdownToHtml(text);
        else if(extension==='txt')content=text.split(/\r?\n/).map(line=>'<p>'+(app.escapeHtml(line)||'<br>')+'</p>').join('');
        else{const parsed=new DOMParser().parseFromString(text,'text/html');headerHtml=parsed.querySelector('header')?.innerHTML||'';footerHtml=parsed.querySelector('footer')?.innerHTML||'';try{layout=JSON.parse(parsed.querySelector('meta[name="webeditor-layout"]')?.content||'null');}catch(_){}parsed.querySelectorAll('header,footer').forEach(el=>el.remove());content=(parsed.querySelector('main')||parsed.body).innerHTML;}
      }
      app.addNewDocument();app.currentDoc.name=file.name.replace(/\.[^.]+$/,'');
      app.commands.change(()=>{app.editor.innerHTML=WebEditorCommands.sanitize(content)||'<p><br></p>';app.currentDoc.headerHtml=WebEditorCommands.sanitize(headerHtml);app.currentDoc.footerHtml=WebEditorCommands.sanitize(footerHtml);app.currentDoc.layout=EditorLayout.normalize(layout);app.restoreHeaderFooter();app.layout.render();});
      app.storage.rebuildTabs();app.commands.clearSelection();app.showToast(extension==='docx'?'Word content imported. Complex Word layouts may differ.':'Document opened in a new tab.','success');
    }catch(error){app.showToast(error.message||'The document could not be opened.','error');}
  }
  checkWriting(){
    const app=this.app,text=app.editor.textContent;this.analysis={id:app.currentDocId,text};
    const findings=[];for(const match of text.matchAll(/\b(teh)\b/gi))findings.push({start:match.index,end:match.index+match[0].length,replacement:match[0][0]==='T'?'The':'the',message:'Possible typo: “teh” → “the”.'});
    for(const match of text.matchAll(/\b([\p{L}]{2,})[ \t]+\1\b/giu))findings.push({start:match.index,end:match.index+match[0].length,replacement:match[1],message:`Repeated word: “${match[1]}”.`});
    for(const match of text.matchAll(/\S([ \t]{2,})\S/g))findings.push({start:match.index+1,end:match.index+1+match[1].length,replacement:' ',message:'Extra spaces between words.'});
    const panel=document.getElementById('grammarSuggestions');panel.replaceChildren();panel.style.display='block';
    for(const finding of findings.slice(0,20)){const item=document.createElement('div');item.className='grammar-suggestion';const message=document.createElement('p');message.textContent=finding.message;const button=document.createElement('button');button.className='btn btn-secondary';button.textContent='Apply correction';button.addEventListener('click',()=>{if(app.currentDocId!==this.analysis.id||app.editor.textContent!==this.analysis.text){app.showToast('The document changed. Run the check again.','info');return;}app.commands.change(()=>app.commands.replaceRange(finding.start,finding.end,finding.replacement));this.checkWriting();});item.append(message,button);panel.append(item);}
    document.getElementById('grammarStatusText').textContent=findings.length?`${findings.length} local suggestion${findings.length===1?'':'s'}`:'No matching issues found by these local checks.';document.getElementById('grammarStatusIndicator').className='status-indicator '+(findings.length?'warning':'success');app.updateAIStats();
  }
  previewEdit(kind){
    const app=this.app,selection=app.commands.restore();if(!selection.toString().trim())return app.showToast('Select text in the document first.','info');
    const original=selection.toString(),range=selection.getRangeAt(0).cloneRange(),id=app.currentDocId;
    const result=kind==='shorten'?app.shortenText(original):app.improveText(original);
    const body=document.createElement('div');const label=document.createElement('p');label.textContent='Preview the replacement. Applying it replaces formatting within the selected text.';const preview=document.createElement('p');preview.className='edit-preview';preview.textContent=result;body.append(label,preview);
    this.dialog('Review text change',body,[{label:'Apply replacement',primary:true,run:modal=>{if(app.currentDocId!==id||!app.editor.contains(range.commonAncestorContainer)||range.toString()!==original)return app.showToast('The selection changed. Select the text again.','warning');app.commands.range=range;app.commands.docId=id;app.executeCommand('insertText',result);modal.classList.remove('active');}}]);
  }
}

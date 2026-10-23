/* Selection, history, and editing commands share one mutation boundary. */
class WebEditorCommands {
  constructor(app) { this.app = app; this.range = null; this.docId = null; }
  static sanitize(html) {
    const template = document.createElement('template'); template.innerHTML = window.DOMPurify ? DOMPurify.sanitize(String(html), {FORBID_TAGS:['style','form','input','button','textarea','select'],FORBID_ATTR:['contenteditable','autofocus']}) : String(html);
    template.content.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,link,meta,base,svg,math').forEach(el => el.remove());
    template.content.querySelectorAll('*').forEach(el => {
      for (const attribute of [...el.attributes]) {
        const value = attribute.value.replace(/[\u0000-\u0020]/g, '');
        if (/^on/i.test(attribute.name) || ['srcdoc','contenteditable','autofocus'].includes(attribute.name) || (['href','src','xlink:href'].includes(attribute.name) && !/^(https?:|mailto:|tel:|#|data:image\/(png|jpeg|gif|webp);base64,)/i.test(value)) || (attribute.name === 'style' && /url\s*\(|expression\s*\(|@import/i.test(attribute.value))) el.removeAttribute(attribute.name);
      }
    });
    return template.innerHTML;
  }
  root() { return this.app.hfEditMode ? document.getElementById(this.app.hfActiveZone === 'header' ? 'pageHeaderContent' : 'pageFooterContent') : this.app.editor; }
  clearSelection() { this.range = null; this.docId = null; }
  remember() {
    const selection = getSelection(), editor = this.root();
    if (selection.rangeCount && editor.contains(selection.anchorNode) && editor.contains(selection.focusNode)) {
      this.range = selection.getRangeAt(0).cloneRange(); this.docId = this.app.currentDocId;
    }
  }
  restore() {
    const app = this.app, editor = this.root(); editor.focus({preventScroll:true});
    const selection = getSelection();
    if (this.range && this.docId === app.currentDocId && editor.contains(this.range.commonAncestorContainer)) { selection.removeAllRanges(); selection.addRange(this.range); }
    else if (!selection.rangeCount || !editor.contains(selection.anchorNode)) { const range = document.createRange(); range.selectNodeContents(editor); range.collapse(false); selection.removeAllRanges(); selection.addRange(range); }
    return selection;
  }
  change(action) {
    this.app.storage.record(); action(); this.remember();
    this.app.currentDoc.dirty = true; this.app.hasUnsavedChanges = true;
    this.app.saveDocumentState(); this.app.updateWordCount(); this.app.updateOutline(); this.app.workspace?.syncFormatting();
  }
  execute(command, value = null) {
    this.restore();
    this.change(() => {
      document.execCommand('styleWithCSS', false, true);
      if (command === 'fontSize') {
        const points = parseFloat(value); if (!Number.isFinite(points) || points < 8 || points > 96) return;
        document.execCommand('fontSize', false, '7');
        const range = getSelection().getRangeAt(0);
        this.root().querySelectorAll('font[size="7"],span[style]').forEach(el => {
          if ((el.getAttribute('size') === '7' || el.style.fontSize === 'xxx-large') && (range.intersectsNode(el) || el.contains(range.startContainer))) { el.removeAttribute('size'); el.style.fontSize = points + 'pt'; }
        });
      } else document.execCommand(command, false, value);
    });
  }
  style(name) {
    const tags = {normal:'p',heading1:'h1',heading2:'h2',heading3:'h3',quote:'blockquote',code:'pre'};
    if (tags[name]) this.execute('formatBlock', tags[name]);
  }
  paragraphs() {
    const range = this.restore().getRangeAt(0);
    const blocks = [...this.root().querySelectorAll('p,h1,h2,h3,h4,li,blockquote,pre')].filter(el => range.collapsed ? el.contains(range.startContainer) : range.intersectsNode(el));
    return blocks.filter(el => !blocks.some(other => other !== el && el.contains(other)));
  }
  paragraphFormat(styles) {
    let blocks = this.paragraphs();
    this.change(() => {
      if (!blocks.length) { document.execCommand('formatBlock', false, 'p'); blocks = this.paragraphs(); }
      blocks.forEach(el => Object.assign(el.style, styles));
    });
  }
  undo() {
    clearTimeout(this.app.autoSaveTimer); this.app.storage.record(); this.restoreHistory(this.app.currentDoc.historyIndex - 1);
  }
  redo() { this.restoreHistory(this.app.currentDoc.historyIndex + 1); }
  restoreHistory(index) {
    const doc = this.app.currentDoc;
    if (index < 0 || index >= doc.history.length) return;
    doc.historyIndex = index; this.app.storage.apply(doc.history[index]);
    this.app.saveDocumentState(false); this.app.workspace?.renderHistory();
  }
  textNodes() {
    const nodes = [], walker = document.createTreeWalker(this.app.editor, NodeFilter.SHOW_TEXT); let node, offset = 0;
    while ((node = walker.nextNode())) { nodes.push({node,start:offset,end:offset + node.length}); offset += node.length; }
    return nodes;
  }
  textRange(start, end) {
    const nodes = this.textNodes(); const first = nodes.find(item => item.end > start), last = nodes.find(item => item.end >= end);
    if (!first || !last) return null;
    const range = document.createRange(); range.setStart(first.node,start-first.start); range.setEnd(last.node,end-last.start); return range;
  }
  replaceRange(start, end, replacement) {
    const range = this.textRange(start,end); if (!range) return;
    range.deleteContents(); range.insertNode(document.createTextNode(replacement));
  }
  replaceAll() {
    const needle = document.getElementById('replaceFindInput').value, replacement = document.getElementById('replaceInput').value;
    if (!needle) return this.app.showToast('Enter text to find.', 'warning');
    const text = this.app.editor.textContent, regex = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
    const matches = [...text.matchAll(regex)];
    if (!matches.length) return this.app.showToast('No matches found.', 'info');
    this.change(() => matches.reverse().forEach(match => this.replaceRange(match.index,match.index+match[0].length,replacement)));
    this.clearSelection(); this.app.showToast(`Replaced ${matches.length} occurrences.`, 'success');
  }
  find(term, backwards = false) {
    if (!term) return this.app.showToast('Enter text to find.', 'warning');
    if (this.app.hfEditMode) this.app.closeHeaderFooterMode();
    const text = this.app.editor.textContent.toLocaleLowerCase();
    this.restore(); const current = getSelection().getRangeAt(0), prefix = document.createRange(); prefix.selectNodeContents(this.app.editor); prefix.setEnd(backwards ? current.startContainer : current.endContainer, backwards ? current.startOffset : current.endOffset);
    const offset = prefix.toString().length, needle = term.toLocaleLowerCase();
    let index = backwards ? text.lastIndexOf(needle, offset - 1) : text.indexOf(needle, offset);
    if (index < 0) index = backwards ? text.lastIndexOf(needle) : text.indexOf(needle);
    const range = index >= 0 ? this.textRange(index,index+term.length) : null;
    if (!range) return this.app.showToast('No matches found.', 'info');
    getSelection().removeAllRanges(); getSelection().addRange(range); this.remember();
    range.startContainer.parentElement.scrollIntoView({block:'center',inline:'nearest'});
  }
  replaceCurrent() {
    const term = document.getElementById('replaceFindInput').value;
    const selection = this.restore();
    if (term && selection.toString().toLocaleLowerCase() === term.toLocaleLowerCase()) this.execute('insertText',document.getElementById('replaceInput').value);
    else this.find(term);
  }
}

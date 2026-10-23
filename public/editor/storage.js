/* Browser recovery storage. IndexedDB is primary; local storage is a fallback. */
class WebEditorStorage {
  static get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  static set(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  static remove(key) { try { localStorage.removeItem(key); } catch (_) {} }
  static json(key, fallback = null) { try { const value = JSON.parse(this.get(key)) ?? fallback; return Array.isArray(fallback) && !Array.isArray(value) ? fallback : value; } catch (_) { return fallback; } }
  constructor(app) {
    this.app = app;
    this.records = new Map();
    this.hiddenRecent = new Set(WebEditorStorage.json('webeditor_hidden_recent', []));
    this.ready = this.openDatabase().catch(() => null);
  }
  openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return resolve(null);
      const request = indexedDB.open('webeditor-recovery', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('documents', { keyPath: 'id' });
        request.result.createObjectStore('settings');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve(null);
    });
  }
  async transaction(store, mode, action) {
    const db = await this.ready;
    if (!db) throw new Error('Recovery database unavailable');
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const request = action(tx.objectStore(store));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('Recovery storage failed'));
    });
  }
  legacyRecords() {
    const records = new Map();
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('webeditor_document_')) {
          const record = WebEditorStorage.json(key);
          if (record?.id && typeof record.content === 'string') records.set(record.id, record);
        }
      }
      for (const key of Object.keys(localStorage)) {
        const match = key.match(/^charles_editor_doc_(doc[\w-]*?)$/);
        if (!match || /_(name|header|footer|layout)$/.test(match[1]) || records.has(match[1])) continue;
        const id = match[1];
        records.set(id, { id, name: WebEditorStorage.get(key + '_name') || 'Recovered document', content: WebEditorStorage.get(key) || '', headerHtml: WebEditorStorage.get(key + '_header') || '', footerHtml: WebEditorStorage.get(key + '_footer') || '', layout: WebEditorStorage.json(key + '_layout'), lastSave: 0 });
      }
    } catch (_) { /* Recovery still works when browser local storage is disabled. */ }
    return records;
  }
  normalize(record) {
    const app = this.app;
    const doc = { ...record, content: WebEditorCommands.sanitize(record.content || '<p><br></p>'), headerHtml: WebEditorCommands.sanitize(record.headerHtml || ''), footerHtml: WebEditorCommands.sanitize(record.footerHtml || ''), history: [], historyIndex: 0, dirty: false };
    doc.layout = EditorLayout.normalize(record.layout);
    doc.history = (Array.isArray(record.history) ? record.history : []).map(state => typeof state === 'string' ? { content: WebEditorCommands.sanitize(state), headerHtml: '', footerHtml: '', layout: doc.layout } : { ...state, content: WebEditorCommands.sanitize(state.content || ''), headerHtml: WebEditorCommands.sanitize(state.headerHtml || ''), footerHtml: WebEditorCommands.sanitize(state.footerHtml || ''), layout: EditorLayout.normalize(state.layout) });
    if (!doc.history.length) doc.history = [this.stateFromRecord(doc)];
    doc.historyIndex = Math.max(0, Math.min(doc.history.length - 1, record.historyIndex ?? doc.history.length - 1));
    return doc;
  }
  stateFromRecord(doc) { return { content: doc.content, headerHtml: doc.headerHtml || '', footerHtml: doc.footerHtml || '', layout: EditorLayout.normalize(doc.layout) }; }
  capture() {
    const app = this.app;
    return { content: WebEditorCommands.sanitize(app.editor.innerHTML), headerHtml: WebEditorCommands.sanitize(document.getElementById('pageHeaderContent').innerHTML), footerHtml: WebEditorCommands.sanitize(document.getElementById('pageFooterContent').innerHTML), layout: EditorLayout.normalize(app.currentDoc.layout) };
  }
  loadLegacyCurrent() {
    const record = this.legacyRecords().get(this.app.currentDocId);
    this.app.currentDoc = this.app.documents[this.app.currentDocId] = this.normalize(record || this.app.currentDoc);
    this.apply(this.stateFromRecord(this.app.currentDoc));
  }
  async initialize() {
    this.records = this.legacyRecords();
    let session = WebEditorStorage.json('webeditor_session_v2');
    try {
      const records = await this.transaction('documents', 'readonly', store => store.getAll());
      for (const record of records) {
        const local = this.records.get(record.id);
        if (!local || new Date(record.lastSave || 0) >= new Date(local.lastSave || 0)) this.records.set(record.id, record);
      }
      session = await this.transaction('settings', 'readonly', store => store.get('session')) || session;
    } catch (_) {}
    const app = this.app;
    if (!this.records.size) this.records.set(app.currentDocId, app.currentDoc);
    let ids = Array.isArray(session?.openIds) ? session.openIds.filter(id => this.records.has(id)) : [];
    if (!ids?.length) ids = [this.records.has('doc1') ? 'doc1' : this.records.keys().next().value];
    app.documents = Object.fromEntries(ids.map(id => [id, this.normalize(this.records.get(id))]));
    app.currentDocId = ids.includes(session?.activeId) ? session.activeId : ids[0];
    app.currentDoc = app.documents[app.currentDocId];
    this.apply(this.stateFromRecord(app.currentDoc));
    this.rebuildTabs(); this.refreshRecent();
    app.updateSaveStatus(app.currentDoc.lastSave ? 'Recovered in this browser' : 'Not saved yet');
  }
  rebuildTabs() {
    const tabs = document.getElementById('documentTabs'); tabs.replaceChildren();
    for (const doc of Object.values(this.app.documents)) {
      const tab = document.createElement('div'); tab.className = 'tab' + (doc.id === this.app.currentDocId ? ' active' : ''); tab.dataset.docId = doc.id;
      const title = document.createElement('span'); title.textContent = doc.name;
      const close = document.createElement('button'); close.className = 'tab-close'; close.textContent = '×'; close.title = 'Close document';
      tab.append(title, close); tabs.append(tab);
    }
  }
  apply(state) {
    const app = this.app;
    app.editor.innerHTML = state.content || '<p><br></p>';
    app.currentDoc.content = app.editor.innerHTML;
    app.currentDoc.headerHtml = state.headerHtml || ''; app.currentDoc.footerHtml = state.footerHtml || '';
    app.currentDoc.layout = EditorLayout.normalize(state.layout);
    app.restoreHeaderFooter(); app.layout?.render(); app.commands?.clearSelection();
    app.updateWordCount(); app.updateOutline(); window.statsDashboard?.updateStats?.();
  }
  record() {
    const doc = this.app.currentDoc, state = this.capture();
    Object.assign(doc, state);
    doc.history ||= []; doc.historyIndex ??= -1;
    if (JSON.stringify(doc.history[doc.historyIndex]) !== JSON.stringify(state)) {
      doc.history = doc.history.slice(0, doc.historyIndex + 1);
      doc.history.push(state);
      if (doc.history.length > 100) doc.history.shift();
      doc.historyIndex = doc.history.length - 1;
    }
    this.app.workspace?.renderHistory();
    return state;
  }
  persistSession() {
    const session = { openIds: Object.keys(this.app.documents), activeId: this.app.currentDocId };
    WebEditorStorage.set('webeditor_session_v2', JSON.stringify(session));
    return this.transaction('settings', 'readwrite', store => store.put(session, 'session')).catch(() => {});
  }
  async save(recordHistory = true) {
    const app = this.app, doc = app.currentDoc;
    const state = recordHistory ? this.record() : this.capture();
    Object.assign(doc, state); doc.dirty = true;
    app.hasUnsavedChanges = true; app.updateSaveStatus('Saving in this browser…');
    const historyStart = Math.max(0, doc.historyIndex - 19);
    const record = { id: doc.id, name: doc.name, ...state, lastSave: new Date().toISOString(), history: doc.history.slice(historyStart, doc.historyIndex + 1), historyIndex: doc.historyIndex - historyStart };
    // Keep a compact synchronous fallback without duplicating large history data.
    const local = WebEditorStorage.set('webeditor_document_' + doc.id, JSON.stringify({ ...record, history: undefined, historyIndex: undefined }));
    let durable = false;
    try { await this.transaction('documents', 'readwrite', store => store.put(record)); durable = true; } catch (_) {}
    const success = durable || local;
    if (success) {
      this.records.set(doc.id, record); doc.lastSave = record.lastSave;
      if (app.currentDocId !== doc.id || JSON.stringify(this.capture()) === JSON.stringify(state)) doc.dirty = false;
      this.hiddenRecent.delete(doc.id); this.refreshRecent();
    }
    app.hasUnsavedChanges = Object.values(app.documents).some(item => item.dirty);
    if (app.currentDocId === doc.id) app.updateSaveStatus(success ? (doc.dirty ? 'Newer edits not saved yet' : 'Saved in this browser') : 'Browser save failed — download a copy');
    if (!success && !this.warned) { app.showToast('Browser storage is unavailable or full. Download a copy to keep your work.', 'warning'); this.warned = true; }
    await this.persistSession();
    return success;
  }
  refreshRecent() {
    this.app.recentDocuments = [...this.records.values()].filter(record => !this.hiddenRecent.has(record.id)).sort((a,b) => new Date(b.lastSave || 0) - new Date(a.lastSave || 0)).map(record => ({ ...record, lastModified: record.lastSave || new Date().toISOString(), contentPreview: record.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 70) }));
    this.app.updateRecentDocumentsList();
  }
  async open(id) {
    if (!this.app.documents[id]) {
      const record = this.records.get(id); if (!record) return;
      this.app.documents[id] = this.normalize(record); this.rebuildTabs();
    }
    this.app.switchDocument(id);
  }
  clearRecent() {
    this.hiddenRecent = new Set(this.records.keys());
    WebEditorStorage.set('webeditor_hidden_recent', JSON.stringify([...this.hiddenRecent])); this.refreshRecent();
  }
}

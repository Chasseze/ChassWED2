class EditorLayout {
  static sizes = {a4:[210,297],letter:[215.9,279.4],legal:[215.9,355.6]};
  static normalize(value = {}) {
    value ||= {};
    const layout = {size:EditorLayout.sizes[value.size] ? value.size : 'a4',orientation:value.orientation === 'landscape' ? 'landscape' : 'portrait'};
    for (const edge of ['top','bottom','left','right']) layout[edge] = Number.isFinite(Number(value[edge])) && value[edge] !== undefined ? Math.max(0,Math.min(75,Number(value[edge]))) : 25;
    return layout;
  }
  constructor(app) { this.app = app; this.autoFit = true; this.view = WebEditorStorage.get('webeditor_view') || 'auto'; }
  dimensions() { const layout = this.app.currentDoc.layout || EditorLayout.normalize(); const size=[...EditorLayout.sizes[layout.size]]; if(layout.orientation==='landscape')size.reverse();return size; }
  render() {
    const app = this.app, layout = app.currentDoc.layout = EditorLayout.normalize(app.currentDoc.layout);
    const [width,height] = this.dimensions();
    const available = Math.max(100,app.pageContainer.clientWidth - 24);
    const reflow = this.view === 'writing' || (this.view === 'auto' && available < 600);
    app.page.classList.toggle('writing-view', reflow);
    app.page.style.transform = '';
    app.page.style.setProperty('--page-width', width + 'mm');
    app.page.style.setProperty('--page-height', height + 'mm');
    app.page.style.setProperty('--page-margins', `${layout.top}mm ${layout.right}mm ${layout.bottom}mm ${layout.left}mm`);
    if (this.autoFit) app.zoomLevel = reflow ? 100 : Math.max(20,Math.min(100,Math.floor(available/(width*96/25.4)*100)));
    const scale=app.zoomLevel/100;
    app.page.style.zoom=scale;
    app.page.style.width = reflow ? `${Math.max(100,available / scale)}px` : width+'mm';
    app.page.style.minHeight = reflow ? '400px' : height+'mm';
    app.editor.style.padding='0'; app.editor.style.minHeight='0';
    app.currentPageSize=layout.size; app.currentPageOrientation=layout.orientation;
    for(const edge of ['top','bottom','left','right'])app['currentMargin'+edge[0].toUpperCase()+edge.slice(1)]=layout[edge];
    for(const id of ['pageSize','pageSizeSelect','pageSizeSelectModal']){const el=document.getElementById(id);if(el)el.value=layout.size;}
    for(const id of ['pageOrientation','pageOrientationModal']){const el=document.getElementById(id);if(el)el.value=layout.orientation;}
    document.getElementById('zoomPercent').textContent=app.zoomLevel+'%';
    const zoom=document.getElementById('workspaceZoom');if(zoom)zoom.value=app.zoomLevel;
    const view=document.getElementById('workspaceView');if(view)view.value=this.view;
    const indicator=document.getElementById('viewIndicator');if(indicator)indicator.textContent=reflow?'Writing view':'Print layout';
    let style=document.getElementById('documentPrintStyle');if(!style){style=document.createElement('style');style.id='documentPrintStyle';document.head.append(style);}
    style.textContent=`@media print{@page{size:${width}mm ${height}mm;margin:${layout.top}mm ${layout.right}mm ${layout.bottom}mm ${layout.left}mm;}}`;
  }
  set(update) { this.app.commands.change(()=>{this.app.currentDoc.layout=EditorLayout.normalize({...this.app.currentDoc.layout,...update});this.render();}); }
  setView(view) { this.view=view;this.autoFit=true;WebEditorStorage.set('webeditor_view',view);this.render(); }
  fit() { this.autoFit=true;this.render(); }
  zoom(value) { this.autoFit=false;this.app.zoomLevel=Math.max(20,Math.min(200,Number(value)||100));this.render(); }
  showSettings() {
    const value=this.app.currentDoc.layout;
    document.getElementById('pageSizeSelectModal').value=value.size;
    document.getElementById('pageOrientationModal').value=value.orientation;
    for(const edge of ['top','bottom','left','right'])document.getElementById('margin'+edge[0].toUpperCase()+edge.slice(1)+'Modal').value=value[edge];
    document.getElementById('pageLayoutModal').classList.add('active');
  }
  applySettings() {
    const next={size:document.getElementById('pageSizeSelectModal').value,orientation:document.getElementById('pageOrientationModal').value};
    for(const edge of ['top','bottom','left','right']){
      const value=Number(document.getElementById('margin'+edge[0].toUpperCase()+edge.slice(1)+'Modal').value);
      if(!Number.isFinite(value)||value<0||value>75)return this.app.showToast('Margins must be between 0 and 75 mm.','warning');
      next[edge]=value;
    }
    this.set(next);this.app.hidePageLayoutModal();
  }
}

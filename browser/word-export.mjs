import {Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, ExternalHyperlink, InternalHyperlink, ImageRun, PageNumber, AlignmentType, LevelFormat, WidthType, BorderStyle, ShadingType, VerticalAlign, PageOrientation, UnderlineType} from 'docx';

// A local OOXML writer: Word downloads work on static hosting and mobile browsers.
const mm = value => Math.round(Number(value) * 1440 / 25.4);
const blockTags = /^(P|DIV|H[1-6]|BLOCKQUOTE|PRE|UL|OL|TABLE|SECTION|ARTICLE|HEADER|FOOTER|MAIN|HR)$/;
function points(value) {
  const n=parseFloat(value);if(!Number.isFinite(n))return undefined;
  return /pt$/.test(value)?n:/mm$/.test(value)?n*72/25.4:/in$/.test(value)?n*72:n*.75;
}
function color(value) {
  if(!value || value==='transparent')return undefined;
  if(/^#[\da-f]{6}$/i.test(value))return value.slice(1).toUpperCase();
  if(/^#[\da-f]{3}$/i.test(value))return value.slice(1).split('').map(c=>c+c).join('').toUpperCase();
  const rgb=value.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);if(rgb)return rgb.slice(1).map(n=>Math.min(255,Number(n)).toString(16).padStart(2,'0')).join('').toUpperCase();
  return {black:'000000',white:'FFFFFF',red:'FF0000',blue:'0000FF',green:'008000',yellow:'FFFF00',gray:'808080'}[value.toLowerCase()];
}
function formatting(element,inherited={}) {
  const s=element.style||{},tag=element.tagName,result={...inherited};
  if(['B','STRONG'].includes(tag))result.bold=true;
  if(['I','EM'].includes(tag))result.italics=true;
  if(tag==='U')result.underline={type:UnderlineType.SINGLE};
  if(['S','STRIKE','DEL'].includes(tag))result.strike=true;
  if(tag==='SUP')result.superScript=true;if(tag==='SUB')result.subScript=true;
  if(['PRE','CODE'].includes(tag))result.font='Courier New';
  if(s.fontFamily)result.font=s.fontFamily.split(',')[0].replace(/["']/g,'').trim();
  if(s.fontSize && points(s.fontSize))result.size=Math.round(points(s.fontSize)*2);
  if(s.fontWeight)result.bold=/bold/i.test(s.fontWeight)||Number(s.fontWeight)>=600;
  if(s.fontStyle)result.italics=s.fontStyle==='italic';
  if(s.textDecoration?.includes('underline'))result.underline={type:UnderlineType.SINGLE};
  if(s.textDecoration?.includes('line-through'))result.strike=true;
  if(color(s.color))result.color=color(s.color);
  if(color(s.backgroundColor))result.shading={type:ShadingType.CLEAR,fill:color(s.backgroundColor)};
  return result;
}
export async function toBlob(data,dom=document) {
  const numbering=[],images=new Map();let listId=0;
  const root=dom.createElement('div');root.innerHTML=data.html||'<p></p>';
  const header=dom.createElement('div');header.innerHTML=data.headerHtml||'';
  const footer=dom.createElement('div');footer.innerHTML=data.footerHtml||'';
  for(const image of [...root.querySelectorAll('img'),...header.querySelectorAll('img'),...footer.querySelectorAll('img')]){
    const match=(image.getAttribute('src')||'').match(/^data:image\/(png|jpe?g|gif|bmp|webp);base64,([\s\S]+)$/i);
    if(!match)throw new Error('A document image cannot be embedded in Word. Insert a PNG or JPEG image from your device, then save again.');
    let type=match[1].toLowerCase().replace('jpeg','jpg'),bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));
    let width=Number(image.getAttribute('width'))||parseFloat(image.style.width),height=Number(image.getAttribute('height'))||parseFloat(image.style.height);
    if(type==='png'&&bytes.length>24){const view=new DataView(bytes.buffer);const naturalWidth=view.getUint32(16),naturalHeight=view.getUint32(20);width ||=naturalWidth;height ||=width*naturalHeight/naturalWidth;}
    if(type==='webp'||!width||!height){
      const picture=new dom.defaultView.Image();
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('An image could not be prepared for Word.')),5000);picture.onload=()=>{clearTimeout(timer);resolve();};picture.onerror=()=>{clearTimeout(timer);reject(new Error('An image could not be read.'));};picture.src=image.src;});
      width ||=picture.naturalWidth;height ||=width*picture.naturalHeight/picture.naturalWidth;
      if(type==='webp'){const canvas=dom.createElement('canvas');canvas.width=picture.naturalWidth;canvas.height=picture.naturalHeight;canvas.getContext('2d').drawImage(picture,0,0);bytes=Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]),c=>c.charCodeAt(0));type='png';}
    }
    const scale=Math.min(1,550/width);images.set(image,{type,data:bytes,transformation:{width:Math.max(1,width*scale),height:Math.max(1,height*scale)},altText:{title:image.alt||'Image',description:image.alt||'Image',name:image.alt||'Image'}});
  }
  function inline(node,style={}) {
    if(node.nodeType===3)return [new TextRun({...style,text:node.textContent.replace(/\s+/g,' ')})];
    if(node.nodeType!==1)return [];
    const next=formatting(node,style);
    if(node.tagName==='BR')return [new TextRun({...next,break:1})];
    if(node.tagName==='IMG')return images.has(node)?[new ImageRun(images.get(node))]:[];
    if(node.classList.contains('pageNumber')||node.classList.contains('hf-page-num'))return [new TextRun({...next,children:[PageNumber.CURRENT]})];
    const children=[...node.childNodes].flatMap(child=>inline(child,next));
    if(node.tagName==='A'){
      const href=node.getAttribute('href')||'';
      if(href.startsWith('#'))return [new InternalHyperlink({anchor:href.slice(1),children})];
      if(/^(https?:|mailto:|tel:)/i.test(href))return [new ExternalHyperlink({link:href,children})];
    }
    return children;
  }
  function paragraph(node,inherited={},extra={}) {
    const tag=node.tagName||'P',s=node.style||{},style=formatting(node,inherited),heading=/^H[1-6]$/.test(tag)?'Heading'+tag[1]:undefined;
    const alignment={left:AlignmentType.LEFT,center:AlignmentType.CENTER,right:AlignmentType.RIGHT,justify:AlignmentType.JUSTIFIED}[s.textAlign];
    const spacing={after:160};if(points(s.marginTop)!==undefined)spacing.before=Math.round(points(s.marginTop)*20);if(points(s.marginBottom)!==undefined)spacing.after=Math.round(points(s.marginBottom)*20);
    if(s.lineHeight){const ratio=/^[\d.]+$/.test(s.lineHeight)?Number(s.lineHeight):points(s.lineHeight)/(points(s.fontSize)||12);if(ratio>0)spacing.line=Math.round(ratio*240);}
    const children=tag==='PRE'?[new TextRun({...style,text:node.textContent,font:'Courier New'})]:[...node.childNodes].filter(child=>!['UL','OL'].includes(child.tagName)).flatMap(child=>inline(child,style));
    return new Paragraph({children,heading,alignment,spacing,keepNext:!!heading,pageBreakBefore:s.pageBreakBefore==='always'||s.breakBefore==='page',indent:tag==='BLOCKQUOTE'?{left:360}:s.marginLeft?{left:Math.round((points(s.marginLeft)||0)*20)}:undefined,...extra});
  }
  function list(node,style,level=0) {
    level=Math.min(8,level);const reference='list-'+(++listId),ordered=node.tagName==='OL';
    numbering.push({reference,levels:Array.from({length:9},(_,index)=>({level:index,format:ordered?LevelFormat.DECIMAL:LevelFormat.BULLET,text:ordered?'%'+(index+1)+'.':['•','◦','▪'][index%3],start:Math.max(1,Number(node.getAttribute('start'))||1),alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720+index*360,hanging:300}}}}))});
    return [...node.children].flatMap(item=>[paragraph(item,style,{numbering:{reference,level}}),...[...item.children].filter(child=>['UL','OL'].includes(child.tagName)).flatMap(child=>list(child,style,level+1))]);
  }
  function table(node,style) {
    const borders=Object.fromEntries(['top','bottom','left','right'].map(side=>[side,{style:BorderStyle.SINGLE,size:4,color:'AAB3BF'}]));
    const rows=[...node.rows].filter(row=>row.closest('table')===node).map(row=>new TableRow({children:[...row.cells].map(cell=>{
      const children=blocks(cell,formatting(cell,style));if(!children.length||children.at(-1) instanceof Table)children.push(new Paragraph(''));
      return new TableCell({children,columnSpan:Math.max(1,Number(cell.colSpan)||1),rowSpan:Math.max(1,Number(cell.rowSpan)||1),borders,margins:{top:80,bottom:80,left:80,right:80},verticalAlign:VerticalAlign.TOP,shading:color(cell.style.backgroundColor)?{fill:color(cell.style.backgroundColor)}:undefined});
    })}));
    return new Table({rows,width:{size:100,type:WidthType.PERCENTAGE}});
  }
  function blocks(container,style={}) {
    const result=[];let pending=[];
    const flush=()=>{if(pending.some(node=>node.nodeType===1||node.textContent.trim())){result.push(paragraph({tagName:'P',childNodes:pending,style:{}},style));}pending=[];};
    for(const node of [...container.childNodes]){
      if(node.nodeType!==1||!blockTags.test(node.tagName)){pending.push(node);continue;}flush();
      const next=formatting(node,style);
      if(node.tagName==='TABLE'){if(node.rows.length)result.push(table(node,next));}
      else if(['UL','OL'].includes(node.tagName))result.push(...list(node,next));
      else if(['DIV','SECTION','ARTICLE','HEADER','FOOTER','MAIN'].includes(node.tagName)&&[...node.children].some(child=>blockTags.test(child.tagName)))result.push(...blocks(node,next));
      else result.push(paragraph(node,next));
    }
    flush();return result;
  }
  const settings=data.layout||{},sizes={a4:[210,297],letter:[215.9,279.4],legal:[215.9,355.6]},size=[...(sizes[settings.size]||sizes.a4)];
  const margin={header:360,footer:360,gutter:0};for(const edge of ['top','bottom','left','right'])margin[edge]=mm(Math.max(0,Math.min(75,Number.isFinite(Number(settings[edge]))?Number(settings[edge]):25)));
  const children=blocks(root);if(!children.length)children.push(new Paragraph(''));
  const documentFile=new Document({title:data.filename||'Document',creator:'WebEditor',styles:{default:{document:{run:{font:'Arial',size:24},paragraph:{spacing:{after:160,line:336}}}},paragraphStyles:[1,2,3,4,5,6].map(level=>({id:'Heading'+level,name:'Heading '+level,basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Arial',size:[48,36,28,26,24,24][level-1],bold:true},paragraph:{spacing:{before:240,after:160},keepNext:true}}))},numbering:{config:numbering},sections:[{properties:{page:{size:{width:mm(size[0]),height:mm(size[1]),orientation:settings.orientation==='landscape'?PageOrientation.LANDSCAPE:PageOrientation.PORTRAIT},margin}},headers:data.headerHtml?{default:new Header({children:blocks(header)})}:undefined,footers:data.footerHtml?{default:new Footer({children:blocks(footer)})}:undefined,children}]});
  return Packer.toBlob(documentFile);
}

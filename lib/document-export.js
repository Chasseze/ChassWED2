const sanitizeHtml = require('sanitize-html');
const safeCss = [/^(?!.*(?:url\s*\(|expression\s*\(|@import|javascript:)).+$/i];
const properties = ['color','background-color','background','font-family','font-size','font-weight','font-style','text-decoration','text-align','vertical-align','line-height','letter-spacing','white-space','margin','margin-top','margin-bottom','margin-left','margin-right','padding','padding-top','padding-bottom','padding-left','padding-right','width','height','max-width','border','border-top','border-bottom','border-left','border-right','border-collapse','border-color','border-width','border-style','list-style-type','page-break-before','page-break-after','break-before','break-after','display','gap'];
function cleanHtml(html) {
  return sanitizeHtml(String(html), {
    allowedTags: [...new Set([...sanitizeHtml.defaults.allowedTags,'img','font','header','footer','main','section','article','h1','h2'])],
    allowedAttributes: {'*':['style','class','id'],a:['href','title'],img:['src','alt','width','height'],font:['face','size','color'],td:['colspan','rowspan','width'],th:['colspan','rowspan','width']},
    allowedSchemes:['https','http','mailto','tel'],allowedSchemesByTag:{img:['data']},
    allowedStyles:{'*':Object.fromEntries(properties.map(property=>[property,safeCss]))},
    transformTags:{font:(tag,attributes)=>{const styles=[attributes.style||''];if(attributes.face)styles.push('font-family:'+attributes.face.replace(/[;{}]/g,''));if(attributes.color)styles.push('color:'+attributes.color.replace(/[;{}]/g,''));if(attributes.size)styles.push('font-size:'+({1:8,2:10,3:12,4:14,5:18,6:24,7:36}[attributes.size]||12)+'pt');return{tagName:'span',attribs:{style:styles.join(';')}};}},
  });
}
function layout(input={}) {
  input ||= {};
  const sizes={a4:[210,297],letter:[215.9,279.4],legal:[215.9,355.6]};
  const size=[...(sizes[input.size]||sizes.a4)];if(input.orientation==='landscape')size.reverse();
  const margins={};for(const edge of ['top','right','bottom','left']){const value=Number(input[edge]);margins[edge]=input[edge]!==undefined&&Number.isFinite(value)?Math.max(0,Math.min(75,value)):25;}
  return {width:size[0],height:size[1],margins};
}
const documentCss=`*{box-sizing:border-box}body{font:12pt/1.4 Arial,sans-serif;color:#111;margin:0;padding:0}h1{font:600 24pt/1.2 Arial,sans-serif;margin:18pt 0 10pt}h2{font:600 18pt/1.25 Arial,sans-serif;margin:14pt 0 8pt}h3{font:600 14pt/1.3 Arial,sans-serif;margin:12pt 0 6pt}p{margin:0 0 8pt}ul,ol{margin:0 0 8pt;padding-left:24pt}li{margin-bottom:3pt}table{border-collapse:collapse;width:100%;margin:8pt 0}td,th{border:1px solid #aab3bf;padding:6pt;vertical-align:top}img{max-width:100%;height:auto}a{color:#285da8}blockquote{border-left:2px solid #b4bfce;margin:8pt 0;padding-left:12pt}pre{white-space:pre-wrap;font:10pt/1.4 monospace}h1,h2,h3{break-after:avoid}tr,img{break-inside:avoid}p{orphans:3;widows:3}`;
module.exports={cleanHtml,layout,documentCss};

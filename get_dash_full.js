const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_v2.html','utf8');

// Find "nl more-wrap" class - the top nav More dropdown wrapper
const idx = html.indexOf('nl more-wrap') > 0 ? html.indexOf('nl more-wrap') :
            html.indexOf('more-wrap') > 0 ? html.indexOf('more-wrap') : -1;

if(idx > 0) {
  const divStart = html.lastIndexOf('<div', idx);
  let depth=0, pos=divStart, end=-1;
  while(pos<html.length){
    const no=html.indexOf('<div',pos), nc=html.indexOf('</div>',pos);
    if(nc<0)break;
    if(no>0&&no<nc){depth++;pos=no+4;}
    else{depth--;if(depth===0){end=nc;break;}pos=nc+6;}
  }
  console.log('=== TOP NAV MORE DROPDOWN (Dashboard) ===');
  console.log(html.substring(divStart, end+6));
} else {
  // Try nl class with More text
  let pos=0;
  while(true){
    const ni=html.indexOf('class="nl',pos); if(ni<0)break;
    const lineEnd=html.indexOf('>',ni+10);
    const content=html.substring(ni,lineEnd+100);
    if(content.includes('More')||content.includes('more')){
      console.log('Found nl+More at',ni,':');
      const ds=html.lastIndexOf('<div',ni);
      let d=0,p=ds,e=-1;
      while(p<html.length){const no=html.indexOf('<div',p),nc=html.indexOf('</div>',p);if(nc<0)break;if(no>0&&no<nc){d++;p=no+4;}else{d--;if(d===0){e=nc;break;}p=nc+6;}}
      console.log(html.substring(ds,e+6));
      break;
    }
    pos=ni+1;
  }
}

// Also get the sidebar sb-more-btn full div
const sbIdx = html.indexOf('"sb-more-btn"') > 0 ? html.indexOf('"sb-more-btn"') : html.indexOf('sb-more-btn');
const sbStart = html.lastIndexOf('<div', sbIdx);
// find end - just go to closing </div>
const sbEnd = html.indexOf('</div>', sbStart) + 6;
console.log('\n=== SIDEBAR MORE BUTTON FULL ===');
console.log(html.substring(sbStart, sbEnd));

// Sidebar items container style
const siIdx = html.indexOf('<div id="sb-more-items"');
const siTag = html.substring(siIdx, html.indexOf('>',siIdx)+1);
console.log('\n=== sb-more-items opening tag ===');
console.log(siTag);

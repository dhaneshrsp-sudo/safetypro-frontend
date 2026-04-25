const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_v2.html','utf8');

// Get top nav More dropdown - find more-wrap div
const mwIdx = html.indexOf('class="more-wrap"') > 0 ? html.indexOf('class="more-wrap"') :
              html.indexOf('more-wrap') > 0 ? html.indexOf('more-wrap') : -1;

if(mwIdx > 0) {
  const divStart = html.lastIndexOf('<div', mwIdx);
  // Find matching close div
  let depth=0, pos=divStart, end=-1;
  while(pos < html.length) {
    const no = html.indexOf('<div', pos);
    const nc = html.indexOf('</div>', pos);
    if(nc < 0) break;
    if(no > 0 && no < nc) { depth++; pos=no+4; }
    else { if(depth===0){end=nc; break;} depth--; pos=nc+6; }
  }
  console.log('=== TOP NAV MORE DROPDOWN ===');
  console.log(html.substring(divStart, end+6));
}

// Get sidebar MORE button
const sbBtnIdx = html.indexOf('sb-more-btn');
const sbBtnStart = html.lastIndexOf('<div', sbBtnIdx);
const sbBtnEnd = html.indexOf('</div>', sbBtnStart) + 6;
console.log('\n=== SIDEBAR MORE BUTTON ===');
console.log(html.substring(sbBtnStart, sbBtnEnd));

// Get sb-more-items
const sbItemIdx = html.indexOf('<div id="sb-more-items"');
const sbItemOpen = html.indexOf('>', sbItemIdx)+1;
let d=1, p=sbItemOpen, sbEnd=-1;
while(p<html.length){const no=html.indexOf('<div',p);const nc=html.indexOf('</div>',p);if(nc<0)break;if(no>0&&no<nc){d++;p=no+4;}else{d--;if(d===0){sbEnd=nc;break;}p=nc+6;}}
console.log('\n=== SIDEBAR MORE ITEMS ===');
console.log(html.substring(sbItemIdx, sbEnd+6).substring(0,600));

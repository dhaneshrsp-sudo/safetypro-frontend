const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_v2.html','utf8');

// Find the right panel - it's a fixed-width column in the main area
// Search for common right panel patterns
const terms = ['right-panel','r-panel','col-right','side-panel','std-col','rag-col','score-panel'];
terms.forEach(t => {
  const i = html.indexOf(t); 
  if(i>0) console.log(t,'at',i,':',html.substring(i-20,i+60));
});

// Find the Global HSE Score section
const hseScore = html.indexOf('GLOBAL HSE');
if(hseScore>0) {
  // Walk back to find the containing div
  const divStart = html.lastIndexOf('<div', hseScore-200);
  let d=0,p=divStart,end=-1;
  while(p<html.length){const no=html.indexOf('<div',p),nc=html.indexOf('</div>',p);if(nc<0)break;if(no>0&&no<nc){d++;p=no+4;}else{d--;if(d===0){end=nc;break;}p=nc+6;}}
  console.log('\n=== GLOBAL HSE SCORE PANEL ===');
  console.log(html.substring(divStart, Math.min(divStart+600,end+6)));
}

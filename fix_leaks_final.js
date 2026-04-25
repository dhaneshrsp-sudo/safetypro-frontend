const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Fix malformed <div <div tag
const malformed = '<div <div class="tab-panel" id="tab-objectives"';
const fixed = '<div class="tab-panel" id="tab-objectives"';
if(html.includes(malformed)) {
  html = html.replace(malformed, fixed);
  console.log('✓ Fixed malformed <div <div tag');
} else {
  console.log('Malformed tag not found - checking variation...');
  // Check with spaces
  const idx = html.indexOf('tab-objectives');
  if(idx > 0) console.log('tab-objectives context:', JSON.stringify(html.substring(idx-30, idx+60)));
}

// 2. Find content outside ALL tab-panels (between last </div> of last tab and </div> of .main)
// Find last tab-panel closing
const lastTabPanel = html.lastIndexOf('</div>', html.indexOf('if(main){Array.from'));
console.log('Last tab-panel area at:', lastTabPanel);
// Check what's between last tab panel and .main close
const mainClose = html.indexOf('</div>', lastTabPanel+6);
const gap = html.substring(lastTabPanel+6, mainClose);
console.log('Content after last tab-panel:', JSON.stringify(gap.substring(0,300)));

// 3. Also check for any .main content outside panels
const mainIdx = html.indexOf('<div class="main"');
if(mainIdx > 0) {
  // Find main closing div
  let d=0, p=mainIdx, mainEnd=-1;
  while(p<html.length){const no=html.indexOf('<div',p),nc=html.indexOf('</div>',p);if(nc<0)break;if(no>0&&no<nc){d++;p=no+4;}else{d--;if(d===0){mainEnd=nc;break;}p=nc+6;}}
  console.log('main div closes at:', mainEnd);
  // Check all tab-panels are inside main
  const tabPanelMatches = [];
  let tp = 0;
  while(true){ const ti=html.indexOf('class="tab-panel"',tp); if(ti<0||ti>mainEnd)break; tabPanelMatches.push(ti); tp=ti+1; }
  console.log('Tab panels inside main:', tabPanelMatches.length);
  // Check content between tab panels
  const lastTP = tabPanelMatches[tabPanelMatches.length-1];
  // Find closing of last tab-panel
  let ld=0, lp=lastTP-10, lastTPEnd=-1;
  const lastTPStart = html.lastIndexOf('<div', lastTP);
  ld=0; lp=lastTPStart;
  while(lp<html.length){const no=html.indexOf('<div',lp),nc=html.indexOf('</div>',lp);if(nc<0)break;if(no>0&&no<nc){ld++;lp=no+4;}else{ld--;if(ld===0){lastTPEnd=nc+6;break;}lp=nc+6;}}
  console.log('Last tab-panel ends at:', lastTPEnd);
  const afterLastTP = html.substring(lastTPEnd, mainEnd);
  console.log('Content after all tab-panels (inside main):', JSON.stringify(afterLastTP.substring(0,200)));
}

fs.writeFileSync(path, Buffer.from(html,'utf8'));
console.log('Saved. Size:', html.length);

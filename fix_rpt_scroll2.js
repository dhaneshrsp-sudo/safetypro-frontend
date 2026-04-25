const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// The rpt-tabs-scroll parent div needs min-width:0 to allow overflow
// Also need to check the sub-header structure
const rptIdx = html.indexOf('id="rpt-tabs-scroll"');
if(rptIdx < 0) { console.log('not found'); process.exit(1); }

// Get context around rpt-tabs-scroll
const tagStart = html.lastIndexOf('<div', rptIdx);
const tagEnd = html.indexOf('>', rptIdx) + 1;
const currentTag = html.substring(tagStart, tagEnd);
console.log('Current rpt-tabs-scroll tag:');
console.log(currentTag);

// Get parent tag
const parentTagEnd = html.lastIndexOf('<div', tagStart - 1);
const parentTag = html.substring(parentTagEnd, html.indexOf('>', parentTagEnd)+1);
console.log('\nParent tag:');
console.log(parentTag);

// Get grandparent
const gpEnd = html.lastIndexOf('<div', parentTagEnd - 1);
const gpTag = html.substring(gpEnd, html.indexOf('>', gpEnd)+1);
console.log('\nGrandparent tag:');
console.log(gpTag);

// Check sub-header overflow setting
const shIdx = html.indexOf('class="sub-header"');
const shTag = html.substring(html.lastIndexOf('<div', shIdx), html.indexOf('>', shIdx)+1);
console.log('\nSub-header tag:');
console.log(shTag);

// The fix: rpt-tabs-scroll needs -webkit-overflow-scrolling:touch
// and the sub-header ROW 1 container needs overflow:visible not hidden
// Find ROW 1 div and check its overflow
const row1 = html.indexOf('ROW 1:');
if(row1 > 0) {
  const r1div = html.lastIndexOf('<div', row1);
  const r1tag = html.substring(r1div, html.indexOf('>', r1div)+1);
  console.log('\nROW 1 div:');
  console.log(r1tag);
}

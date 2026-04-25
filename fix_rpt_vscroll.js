const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// Fix .content CSS - change overflow:hidden to allow vertical scroll
// There are multiple .content rules - fix all that have overflow:hidden
let count = 0;

// Rule at 32304: overflow:hidden -> overflow-y:auto
html = html.replace(
  '.content{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;margin-left:0;}',
  '.content{flex:1;display:flex;flex-direction:column;overflow-y:auto;overflow-x:visible;min-height:0;margin-left:0;}'
); count++;

// Rule at 35515: overflow:hidden!important -> overflow-y:auto!important
html = html.replace(
  '.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}',
  '.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:visible!important;display:flex!important;flex-direction:column!important;}'
); count++;

// Also fix .main - ensure it can scroll
const mainFix = html.indexOf('.main{');
if(mainFix > 0) {
  const mainEnd = html.indexOf('}', mainFix);
  const mainRule = html.substring(mainFix, mainEnd+1);
  if(mainRule.includes('overflow:hidden')) {
    html = html.replace(mainRule, mainRule.replace('overflow:hidden', 'overflow-y:auto'));
    count++;
    console.log('Fixed .main overflow');
  }
}

console.log('Fixed', count, 'rules');

// Verify
['.content{flex:1;display:flex;flex-direction:column;overflow-y:auto', '.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto'].forEach(function(check) {
  console.log('Check:', html.includes(check) ? '✓' : '✗ MISSING: '+check);
});

fs.writeFileSync(path, Buffer.from(html, 'utf8'));
console.log('Saved. Size:', html.length);

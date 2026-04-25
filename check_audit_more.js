const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html','utf8');

// 1. Check sb-more-items
const sbStart = html.indexOf('<div id="sb-more-items"');
const sbOpen = html.indexOf('>', sbStart) + 1;
const sbClose = html.indexOf('</div>', sbOpen);
console.log('=== sb-more-items ===');
console.log(html.substring(sbOpen, sbClose));

// 2. Check mm-items (top nav More)
console.log('\n=== mm-items ===');
const firstMm = html.indexOf('<a class="mm-item"');
const lastMmEnd = (() => {
  let pos=0, end=0;
  while(true){ const n=html.indexOf('<a class="mm-item"',pos); if(n<0)break; end=html.indexOf('</a>',n)+4; pos=n+1; }
  return end;
})();
console.log(firstMm>0 ? html.substring(firstMm, lastMmEnd) : 'NO MM-ITEMS FOUND');

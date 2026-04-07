const fs = require('fs');

// Fix 1: Documents - add padding-bottom to scroll wrapper
let h = fs.readFileSync('safetypro_documents.html','utf8');
h = h.replace(
  'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 16px 16px 16px;',
  'class="docs-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 22px 24px 16px;'
);
fs.writeFileSync('safetypro_documents.html', h, 'utf8');
console.log('docs padding-bottom fixed:', h.includes('24px'));

// Fix 2: AI - increase padding-right for smaller screens
let h2 = fs.readFileSync('safetypro_ai.html','utf8');
h2 = h2.replace(
  'class="ai-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 22px 16px 16px;',
  'class="ai-scroll" style="flex:1;overflow-y:scroll;min-height:0;padding:8px 28px 16px 16px;'
);
fs.writeFileSync('safetypro_ai.html', h2, 'utf8');
console.log('ai padding-right fixed:', h2.includes('28px'));

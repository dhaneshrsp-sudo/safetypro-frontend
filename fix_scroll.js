const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Fix 1: Panel - change overflow-y:auto to overflow:auto to allow both directions
h = h.replace(
  'id="ac-legal" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;"',
  'id="ac-legal" style="flex:1;overflow:auto;display:flex;flex-direction:column;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;min-width:0;"'
);

// Fix 2: Table wrapper - ensure horizontal scroll works independently
h = h.replace(
  '<div style="overflow-x:auto;">',
  '<div style="overflow-x:auto;overflow-y:visible;width:100%;">'
);

// Fix 3: Table itself - set min-width so it doesn't compress
h = h.replace(
  '<table style="width:100%;border-collapse:collapse;font-size:11px;" id="ror-table">',
  '<table style="width:100%;min-width:900px;border-collapse:collapse;font-size:11px;" id="ror-table">'
);

console.log('Panel overflow fixed:', h.includes('overflow:auto'));
console.log('Table min-width set:', h.includes('min-width:900px'));
fs.writeFileSync('safetypro_audit_compliance.html', h);

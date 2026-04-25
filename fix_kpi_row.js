const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Make incident KPI cards single row
content = content.replace(
  '<div class="ac-kpi-row" style="flex-wrap:wrap;">',
  '<div class="ac-kpi-row" style="flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;">'
);
console.log('✅ KPI row fixed to single row');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

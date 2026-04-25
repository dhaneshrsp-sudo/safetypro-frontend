const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const layoutFix = content.indexOf('<style id="ac-layout-fix">');
const layoutEnd = content.indexOf('</style>', layoutFix) + 8;
if (layoutFix > -1) {
  const newCSS = content.slice(layoutFix, layoutEnd).replace(
    '</style>',
    `
/* Bar 2 horizontal scroll — no cut-off */
.mt-ctx-bar {
  overflow-x: auto !important;
  scrollbar-width: none !important;
  flex-wrap: nowrap !important;
  white-space: nowrap !important;
}
.mt-ctx-bar::-webkit-scrollbar { display: none !important; }
.mt-ctx-group { flex-shrink: 0 !important; }
.mt-ctx-sel { flex-shrink: 0 !important; }
</style>`
  );
  content = content.slice(0, layoutFix) + newCSS + content.slice(layoutEnd);
  console.log('✅ Bar 2 scroll fix applied');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

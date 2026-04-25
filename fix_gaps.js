const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const layoutFix = content.indexOf('<style id="ac-layout-fix">');
const layoutEnd = content.indexOf('</style>', layoutFix) + 8;
if (layoutFix > -1) {
  const newCSS = content.slice(layoutFix, layoutEnd).replace(
    '</style>',
    `
/* Findings KPI cards gap fix */
#ims-findings > div:first-child {
  display: grid !important;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 10px !important;
  padding: 12px !important;
}
#ims-findings > div:first-child .card {
  margin: 0 !important;
}
/* Analytics cards gap fix */
#ims-analytics .card,
#ims-analytics [style*="grid"] {
  gap: 10px !important;
}
/* General sub-panel content gap */
.ac-sub-panel.active > .card + .card,
.ac-sub-panel.active > div + div {
  margin-top: 10px !important;
}
</style>`
  );
  content = content.slice(0, layoutFix) + newCSS + content.slice(layoutEnd);
  console.log('Fixed gaps');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

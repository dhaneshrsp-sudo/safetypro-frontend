const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

const tag = '<style id="ac-layout-fix">';
const idx = html.indexOf(tag);
const end = html.indexOf('</style>', idx) + 8;

const newCSS = html.slice(idx, end).replace('</style>',
`/* KPI card gaps — all tabs */
.ac-kpi-row { gap:10px !important; }
.card + .card { margin-top:10px !important; }
#ims-kpi-strip { gap:10px !important; }
#ims-kpi-strip .card { margin:0 !important; }
</style>`);

html = html.slice(0, idx) + newCSS + html.slice(end);
const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('Gap fix applied');
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

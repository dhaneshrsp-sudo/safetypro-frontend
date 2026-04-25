const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

const tag = '<style id="ac-layout-fix">';
const idx = html.indexOf(tag);
const end = html.indexOf('</style>', idx) + 8;

const newCSS = html.slice(idx, end).replace('</style>',
`/* Approval tab — Audit Trail card gap */
#ims-ap-trail { margin-top:0 !important; }
#ims-approval > .card:last-child { margin-top:12px !important; }
#ims-approval > div + .card { margin-top:12px !important; }
#ims-approval > .card + .card { margin-top:12px !important; }
</style>`);

html = html.slice(0, idx) + newCSS + html.slice(end);
const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
console.log('✅ Audit Trail gap fixed');
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', html.length);

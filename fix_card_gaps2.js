const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

const tag = '<style id="ac-layout-fix">';
const idx = html.indexOf(tag);
const end = html.indexOf('</style>', idx) + 8;

const newCSS = html.slice(idx, end).replace('</style>',
`/* Card gaps — Planning, Approval, Analytics */
#ims-kpi-strip { gap:10px !important; padding:12px !important; }
#ims-kpi-strip .card { margin:0 !important; }
#ims-approval { gap:12px !important; }
#ims-approval .card { margin:0 !important; }
#ims-analytics { gap:12px !important; padding:12px !important; }
#ims-analytics .card { margin:0 !important; }
#ims-findings > div:first-child { gap:10px !important; padding:12px !important; }
/* Pipeline states gap */
#ims-approval > div:nth-child(2) > div { gap:0; }
/* General card gap inside sub-panels */
.ac-sub-panel.active > * + * { margin-top:10px !important; }
</style>`);

html = html.slice(0, idx) + newCSS + html.slice(end);
const buf = Buffer.from(html, 'utf8');
fs.writeFileSync(path, buf);
console.log('✅ Card gaps fixed');
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', html.length);

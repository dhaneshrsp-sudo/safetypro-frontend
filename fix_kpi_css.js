const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Option C via CSS only — safer than touching HTML
// Primary row (first 4): larger. Secondary row (last 4): smaller
// ac-kpi-row already uses grid repeat(4,1fr) — just add row styling via CSS

const styleTag = '<style id="ac-layout-fix">';
const idx = content.indexOf(styleTag);
const endIdx = content.indexOf('</style>', idx) + 8;

const newCSS = content.slice(idx, endIdx).replace('</style>',
`/* Incident KPI Option C — primary large, secondary compact */
.ac-kpi-row { display:grid!important; grid-template-columns:repeat(4,1fr)!important; gap:10px!important; }
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(-n+4) { padding:14px 10px!important; }
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5) { padding:8px 10px!important; }
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5) .ac-kpi-val { font-size:20px!important; }
#ac-investigation .ac-kpi-row .ac-kpi:nth-child(n+5) .ac-kpi-lbl { font-size:8px!important; }
</style>`);

content = content.slice(0, idx) + newCSS + content.slice(endIdx);
console.log('KPI Option C CSS applied');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', buf.length);

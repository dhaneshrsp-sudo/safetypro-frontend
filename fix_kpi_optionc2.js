const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find the full kpi-row block
const rowStart = content.indexOf('<div class="ac-kpi-row"');
const rowEnd = content.indexOf('</div>', rowStart) + 6;
const rowBlock = content.slice(rowStart, rowEnd);
console.log('Row block length:', rowBlock.length);

// New Option C layout - 2 rows, primary larger, secondary compact
const newBlock = `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
<div class="ac-kpi" style="border-color:#22C55E;padding:14px 10px;"><div class="ac-kpi-val" id="ik-total" style="color:#22C55E;font-size:28px;font-weight:800;">0</div><div class="ac-kpi-lbl">Total Incidents</div></div>
<div class="ac-kpi" style="border-color:#EF4444;padding:14px 10px;"><div class="ac-kpi-val" id="ik-fatal" style="color:#EF4444;font-size:28px;font-weight:800;">0</div><div class="ac-kpi-lbl">Fatalities</div></div>
<div class="ac-kpi" style="border-color:#F97316;padding:14px 10px;"><div class="ac-kpi-val" id="ik-lti" style="color:#F97316;font-size:28px;font-weight:800;">0</div><div class="ac-kpi-lbl">LTI</div></div>
<div class="ac-kpi" style="border-color:#F59E0B;padding:14px 10px;"><div class="ac-kpi-val" id="ik-mtc" style="color:#F59E0B;font-size:28px;font-weight:800;">0</div><div class="ac-kpi-lbl">MTC</div></div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
<div class="ac-kpi" style="border-color:#3B82F6;padding:8px 10px;"><div class="ac-kpi-val" id="ik-nearmiss" style="color:#3B82F6;font-size:20px;font-weight:800;">0</div><div class="ac-kpi-lbl" style="font-size:8px;">Near Misses</div></div>
<div class="ac-kpi" style="border-color:#8B5CF6;padding:8px 10px;"><div class="ac-kpi-val" id="ik-open" style="color:#8B5CF6;font-size:20px;font-weight:800;">0</div><div class="ac-kpi-lbl" style="font-size:8px;">Open Investigations</div></div>
<div class="ac-kpi" style="border-color:#EF4444;padding:8px 10px;"><div class="ac-kpi-val" id="ik-ltifr" style="color:#EF4444;font-size:20px;font-weight:800;">0.00</div><div class="ac-kpi-lbl" style="font-size:8px;">LTIFR (per 200K hrs)</div></div>
<div class="ac-kpi" style="border-color:#F59E0B;padding:8px 10px;"><div class="ac-kpi-val" id="ik-ltisr" style="color:#F59E0B;font-size:20px;font-weight:800;">0.00</div><div class="ac-kpi-lbl" style="font-size:8px;">Severity Rate</div></div>
</div>
</div>`;

content = content.slice(0, rowStart) + newBlock + content.slice(rowEnd);
console.log('✅ Option C applied');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

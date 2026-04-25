const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find the broken section start (the Option C wrapper)
const brokenStart = content.indexOf('<!-- KPI Cards -->\n<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">');
// Find where good content resumes (after the broken section)
const filtersStart = content.indexOf('<!-- Filters -->');

console.log('Broken start:', brokenStart);
console.log('Filters start:', filtersStart);

// Get the broken block
const brokenBlock = content.slice(brokenStart, filtersStart);
console.log('Broken block length:', brokenBlock.length);

// Extract all 8 card lines from the broken block
const cardRegex = /<div class="ac-kpi"[^<]*<div class="ac-kpi-val"[^<]*id="ik-[^"]+[^<]*<\/div>[^<]*<div class="ac-kpi-lbl">[^<]*<\/div><\/div>/g;

// Actually just hardcode the clean version since we know all 8 card IDs
const cleanBlock = `<!-- KPI Cards -->
<div class="ac-kpi-row" style="flex-wrap:wrap;">
<div class="ac-kpi" style="border-color:#22C55E;"><div class="ac-kpi-val" id="ik-total" style="color:#22C55E;">0</div><div class="ac-kpi-lbl">Total Incidents</div></div>
<div class="ac-kpi" style="border-color:#EF4444;"><div class="ac-kpi-val" id="ik-fatal" style="color:#EF4444;">0</div><div class="ac-kpi-lbl">Fatalities</div></div>
<div class="ac-kpi" style="border-color:#F97316;"><div class="ac-kpi-val" id="ik-lti" style="color:#F97316;">0</div><div class="ac-kpi-lbl">LTI</div></div>
<div class="ac-kpi" style="border-color:#F59E0B;"><div class="ac-kpi-val" id="ik-mtc" style="color:#F59E0B;">0</div><div class="ac-kpi-lbl">MTC</div></div>
<div class="ac-kpi" style="border-color:#3B82F6;"><div class="ac-kpi-val" id="ik-nearmiss" style="color:#3B82F6;">0</div><div class="ac-kpi-lbl">Near Misses</div></div>
<div class="ac-kpi" style="border-color:#8B5CF6;"><div class="ac-kpi-val" id="ik-open" style="color:#8B5CF6;">0</div><div class="ac-kpi-lbl">Open Investigations</div></div>
<div class="ac-kpi" style="border-color:#EF4444;"><div class="ac-kpi-val" id="ik-ltifr" style="color:#EF4444;">0.00</div><div class="ac-kpi-lbl">LTIFR (per 200K hrs)</div></div>
<div class="ac-kpi" style="border-color:#F59E0B;"><div class="ac-kpi-val" id="ik-ltisr" style="color:#F59E0B;">0.00</div><div class="ac-kpi-lbl">Severity Rate</div></div>
</div>

`;

content = content.slice(0, brokenStart) + cleanBlock + content.slice(filtersStart);
console.log('✅ KPI section restored');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

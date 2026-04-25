const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Remove Q1/Q2/Q3/Q4/All buttons from buildContextBar imsExtras injection
const oldPeriodButtons = `
'  <div class="mt-ctx-group" style="margin-left:8px;border-left:1px solid var(--border);padding-left:10px;display:flex;gap:3px;">',
'    <button onclick="imsSetPeriod(\\'q1\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q1</button>',
'    <button onclick="imsSetPeriod(\\'q2\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q2</button>',
'    <button onclick="imsSetPeriod(\\'q3\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q3</button>',
'    <button onclick="imsSetPeriod(\\'q4\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q4</button>',
'    <button onclick="imsSetPeriod(\\'all\\')" class="ims-period-btn active" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.4);color:#3B82F6;font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">All</button>',
'  </div>',
'  <button onclick="typeof imsResetContextFilters===\\'function\\'?imsResetContextFilters():null" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;margin-left:4px;">↺ Reset</button>',
`;

if (content.includes(oldPeriodButtons)) {
  content = content.replace(oldPeriodButtons, '\n');
  console.log('✅ Q1/Q2/Q3/Q4/All buttons removed');
} else {
  console.log('❌ Pattern not found — trying line by line search...');
  const idx = content.indexOf("imsSetPeriod(\\'q1\\')");
  if (idx > -1) console.log('Found imsSetPeriod at char:', idx);
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

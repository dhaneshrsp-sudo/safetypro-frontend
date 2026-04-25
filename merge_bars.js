const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Step 1: Remove Bar 3 (ims-context-bar) entirely from HTML
// Find the div and remove it
const bar3Start = content.indexOf('<div id="ims-context-bar"');
const bar3End = content.indexOf('</div>\n\n\n\n\n', bar3Start) + 11;
if (bar3Start > -1) {
  // Find closing </div> properly by counting depth
  let depth = 0;
  let i = bar3Start;
  let end = -1;
  while (i < content.length) {
    if (content.slice(i, i+4) === '<div') depth++;
    else if (content.slice(i, i+6) === '</div>') {
      depth--;
      if (depth === 0) { end = i + 6; break; }
    }
    i++;
  }
  if (end > -1) {
    content = content.slice(0, bar3Start) + content.slice(end);
    console.log('✅ Bar 3 (ims-context-bar) removed');
  } else {
    console.log('❌ Could not find Bar 3 closing div');
  }
} else {
  console.log('❌ Bar 3 not found');
}

// Step 2: Add Quick Period buttons + Reset to the buildContextBar function
// Find where the ctx-bar ends and add period buttons before closing
const ctxEnd = content.indexOf("'  <div class=\"mt-ctx-spacer\"></div>',");
if (ctxEnd > -1) {
  const periodButtons = `
'  <div class="mt-ctx-group" style="margin-left:8px;border-left:1px solid var(--border);padding-left:10px;display:flex;gap:3px;">',
'    <button onclick="imsSetPeriod(\\'q1\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q1</button>',
'    <button onclick="imsSetPeriod(\\'q2\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q2</button>',
'    <button onclick="imsSetPeriod(\\'q3\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q3</button>',
'    <button onclick="imsSetPeriod(\\'q4\\')" class="ims-period-btn" style="background:var(--card);border:1px solid var(--border);color:var(--t2);font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">Q4</button>',
'    <button onclick="imsSetPeriod(\\'all\\')" class="ims-period-btn active" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.4);color:#3B82F6;font-size:10px;padding:3px 7px;border-radius:4px;cursor:pointer;">All</button>',
'  </div>',
'  <button onclick="typeof imsResetContextFilters===\\'function\\'?imsResetContextFilters():null" style="background:var(--raised);border:1px solid var(--border);color:var(--t3);font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;margin-left:4px;">↺ Reset</button>',
`;
  content = content.slice(0, ctxEnd) + periodButtons + content.slice(ctxEnd);
  console.log('✅ Quick Period buttons + Reset added to Bar 2');
} else {
  console.log('❌ ctx-spacer not found');
}

// Step 3: Remove ac-layout-fix rule hiding Bar 3 if present
content = content.replace('\n/* Hide redundant Bar 3 — icon bar has all filters including Zones */\n#ims-context-bar{display:none!important;}\n', '\n');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

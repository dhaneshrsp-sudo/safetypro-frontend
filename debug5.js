const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script #27 starts at line 9680 — show lines 9680 to 9700
console.log('=== SCRIPT 27 area (9680-9700) ===');
for (let i=9679; i<9700; i++) {
  console.log((i+1)+'|'+JSON.stringify(lines[i].substring(0,120)));
}

// Script #32 starts at line 10896 — show lines 10896 to 10915
console.log('\n=== SCRIPT 32 area (10896-10915) ===');
for (let i=10895; i<10915; i++) {
  console.log((i+1)+'|'+JSON.stringify(lines[i].substring(0,120)));
}

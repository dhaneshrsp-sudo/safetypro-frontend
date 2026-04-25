const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');
const start = 9680;

// Find closing })() or })(); pattern in the script
for (let i = start; i < 10215; i++) {
  const t = lines[i].trim();
  if (t.match(/^\}\)\(\)/)) {
    console.log('Found closing at line', i+1, ':', lines[i]);
  }
}

// Also check last 20 lines of script
console.log('\nLast 20 lines of script:');
let s27End = -1;
for (let i = start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}
for (let i = s27End-20; i <= s27End; i++) {
  console.log('L'+(i+1)+':', JSON.stringify(lines[i].substring(0,80)));
}

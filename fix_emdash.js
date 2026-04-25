const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Replace the Unicode em dash in the comment header with ASCII
content = content.replace('/* SafetyPro \u2014 Incident Investigation Engine */', '/* SafetyPro - Incident Investigation Engine */');

// Verify
const idx = content.indexOf('/* SafetyPro - Incident Investigation Engine */');
console.log('Fixed comment at char:', idx);

// Test the script
const lines = content.split('\n');
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i; break; }
}
for (let i = s27Start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}
const sc = lines.slice(s27Start+1, s27End).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) { console.log('S27 still errors:', e.message); }

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

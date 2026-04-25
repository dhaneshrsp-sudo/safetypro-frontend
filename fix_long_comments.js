const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix: any /* === line with 30+ = signs that has no closing */
// Replace with a short one-line comment
let fixes = 0;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  // Long /* === without */ at end
  if (t.startsWith('/*') && !t.endsWith('*/') && t.match(/={20,}/)) {
    lines[i] = '/* ' + '='.repeat(20) + ' ... */';
    console.log('Fix L'+(i+1));
    fixes++;
  }
}
console.log('Total fixes:', fixes);

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);

// Verify
const sl = lines.slice(9680, 9692);
try { new Function(sl.join('\n')); console.log('S27 first 12 lines: CLEAN ✅'); }
catch(e) { if(!e.message.includes('end of input')) console.log('Still ERR:', e.message); else console.log('Only unclosed (OK)'); }

console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

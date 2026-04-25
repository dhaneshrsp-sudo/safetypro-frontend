const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27 boundaries
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i+1; break; }
}
for (let i = s27Start; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}

// Scan for ALL n-prefix issues in script #27
let fixes = 0;
for (let i = s27Start; i < s27End; i++) {
  const t = lines[i];
  if (!t) continue;
  // n followed by JS keywords
  if (/^n(var |window\.|if |else |function |return |let |const |document\.|for |while |switch |case |try |catch |throw )/.test(t)) {
    lines[i] = t.slice(1);
    console.log('Fix L'+(i+1)+':', t.substring(0,60));
    fixes++;
  }
  // indow. pattern (window without w)
  if (/^indow\./.test(t)) {
    lines[i] = 'w' + t;
    console.log('Fix window L'+(i+1)+':', t.substring(0,60));
    fixes++;
  }
}
console.log('Total fixes:', fixes);

content = lines.join('\n');
// Verify
let s27StartNew = -1, s27EndNew = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27StartNew = i+1; break; }
}
for (let i = s27StartNew; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27EndNew = i; break; }
}
const sc = lines.slice(s27StartNew, s27EndNew).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = sc.split('\n');
  console.log('S27 ERR L'+ln+':', e.message, '→', (sl[ln-1]||'').substring(0,80));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

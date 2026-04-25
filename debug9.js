const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Check script #27 (line 9680) - find its actual end
let start = 9679; // line 9680 is <script>
let end = -1;
for (let i = start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { end = i; break; }
}
console.log('Actual script end: line', end+1);

// Extract content and test
const scriptContent = lines.slice(start+1, end).join('\n');
try { new Function(scriptContent); console.log('VALID ✅'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = scriptContent.split('\n');
  console.log('ERROR at script line', ln, ':', e.message);
  for (let i=Math.max(0,ln-2);i<Math.min(sl.length,ln+2);i++) {
    console.log('  ['+(i+1)+']: '+sl[i].substring(0,100));
  }
}

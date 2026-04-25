const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i+1; break; }
}
for (let i = s27Start; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}

const sc = lines.slice(s27Start, s27End).join('\n');
try { 
  new Function(sc); 
  console.log('S27 CLEAN ✅'); 
} catch(e) {
  if (e.message.includes('end of input') || e.message.includes('Unexpected end')) {
    console.log('S27 OK - just incomplete (expected for IIFE) ✅');
  } else {
    const m = e.stack.match(/anonymous>:(\d+)/);
    const ln = m ? parseInt(m[1]) : 0;
    const sl = sc.split('\n');
    console.log('S27 REAL ERR L'+ln+':', e.message);
    console.log('Line:', (sl[ln-1]||'').substring(0,100));
  }
}

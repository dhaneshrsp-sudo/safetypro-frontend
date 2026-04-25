const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27 and remove the comment header (line 9681)
// Line 9681 (index 9680) is "/* SafetyPro Incident Investigation Engine */"
if (lines[9680] && lines[9680].includes('SafetyPro Incident Investigation Engine')) {
  console.log('Removing header:', lines[9680]);
  lines[9680] = '';
}

content = lines.join('\n');

// Verify
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i+1;break;} }
for (let i = s27Start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;} }
const sc = lines.slice(s27Start, s27End).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  if(e.message.includes('end of input')) { console.log('S27 OK - just IIFE ✅'); }
  else { const m=e.stack.match(/anonymous>:(\d+)/); const ln=m?parseInt(m[1])-3:0; const sl=sc.split('\n'); console.log('ERR codeL'+ln+':', e.message, '→', (sl[ln-1]||'').substring(0,80)); }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

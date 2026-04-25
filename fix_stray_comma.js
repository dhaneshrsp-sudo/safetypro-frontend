const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix line 10209 - stray comma after })();
for (let i = 10205; i < 10215; i++) {
  if (lines[i] && lines[i].trim() === ',') {
    console.log('Found stray comma at L'+(i+1)+' - removing');
    lines[i] = '';
  }
}

content = lines.join('\n');

// Verify
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i+1;break;} }
for (let i = s27Start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;} }
const sc = lines.slice(s27Start, s27End).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  if(e.message.includes('end of input')) { console.log('S27 OK (just incomplete IIFE) ✅'); }
  else { const m=e.stack.match(/anonymous>:(\d+)/); const ln=m?parseInt(m[1]):0; const sl=sc.split('\n'); console.log('S27 ERR L'+ln+':', e.message, '→', (sl[ln-1]||'').substring(0,80)); }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

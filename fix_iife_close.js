const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix line 10208: n})(); -> })();
for (let i = 10200; i < 10215; i++) {
  if (lines[i] && lines[i].startsWith('n})()')) {
    lines[i] = lines[i].slice(1); // remove leading 'n'
    console.log('Fix L'+(i+1)+':', lines[i]);
    break;
  }
}

// Also fix lines 10196 and 10207 which have stray ';'
for (let i = 10193; i < 10210; i++) {
  if (lines[i] && lines[i].trim() === ';') {
    console.log('Stray ; at L'+(i+1)+'- removing');
    lines[i] = '';
  }
}

// Fix line 10198: indow.acMainTab -> window.acMainTab
for (let i = 10195; i < 10205; i++) {
  if (lines[i] && lines[i].startsWith('indow.')) {
    lines[i] = 'w' + lines[i];
    console.log('Fix window. at L'+(i+1));
  }
}

content = lines.join('\n');

// Verify
let start = -1, end = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){start=i+1;break;} }
for (let i = start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){end=i;break;} }
const sc = lines.slice(start, end).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = sc.split('\n');
  console.log('S27 ERR L'+ln+':', e.message, '| line:', (sl[ln-1]||'').substring(0,80));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script #27 starts at HTML line 9680 (0-indexed: 9679)
// Find its end
let s27start = 9680, s27end = 9680;
for (let i = 9679; i < 11000; i++) {
  if (lines[i] && lines[i].includes('</script>')) { s27end = i; break; }
}
const s27 = lines.slice(9679, s27end).join('\n');
try { new Function(s27); console.log('S27: OK'); }
catch(e) {
  const m = e.stack.match(/<anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = s27.split('\n');
  console.log('S27 ERROR at script line', ln, ':', e.message);
  for (let i=Math.max(0,ln-3);i<Math.min(sl.length,ln+2);i++) {
    console.log('  ['+(i+1)+'] '+JSON.stringify(sl[i].substring(0,100)));
  }
}

// Script #32 starts at HTML line 10896
let s32end = 10896;
for (let i = 10895; i < 11000; i++) {
  if (lines[i] && lines[i].includes('</script>')) { s32end = i; break; }
}
const s32 = lines.slice(10895, s32end).join('\n');
try { new Function(s32); console.log('S32: OK'); }
catch(e) {
  const m = e.stack.match(/<anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = s32.split('\n');
  console.log('S32 ERROR at script line', ln, ':', e.message);
  for (let i=Math.max(0,ln-3);i<Math.min(sl.length,ln+2);i++) {
    console.log('  ['+(i+1)+'] '+JSON.stringify(sl[i].substring(0,100)));
  }
}

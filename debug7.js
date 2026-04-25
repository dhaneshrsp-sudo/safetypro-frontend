const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script #27 starts at line 9680 which has <script> tag
// Content starts at line 9681 (index 9680)
// Find where it ends
let s27end = -1, s32end = -1;
for (let i = 9680; i < 11000; i++) {
  if (lines[i] && lines[i].includes('</script>') && s27end === -1) { s27end = i; break; }
}
// Script content is lines 9681 to s27end (exclusive)
const s27 = lines.slice(9680, s27end).join('\n');
console.log('S27 length:', s27.length, 'lines:', s27.split('\n').length);
try { new Function(s27); console.log('S27: CLEAN!'); }
catch(e) {
  const m = e.stack.match(/<anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = s27.split('\n');
  console.log('S27 ERROR line', ln, ':', e.message);
  for (let i=Math.max(0,ln-3);i<Math.min(sl.length,ln+3);i++) {
    console.log('  ['+(i+1)+'] '+JSON.stringify(sl[i].substring(0,100)));
  }
}

// Find script #32 start - look for next <script> after line 10895
for (let i = 10895; i < 10900; i++) {
  if (lines[i] && lines[i].includes('<script>')) {
    let end = -1;
    for (let j = i+1; j < 11000; j++) {
      if (lines[j] && lines[j].includes('</script>')) { end = j; break; }
    }
    const s32 = lines.slice(i+1, end).join('\n');
    console.log('\nS32 length:', s32.length, 'lines:', s32.split('\n').length);
    try { new Function(s32); console.log('S32: CLEAN!'); }
    catch(e) {
      const m = e.stack.match(/<anonymous>:(\d+)/);
      const ln = m ? parseInt(m[1]) : 0;
      const sl = s32.split('\n');
      console.log('S32 ERROR line', ln, ':', e.message);
      for (let j2=Math.max(0,ln-3);j2<Math.min(sl.length,ln+3);j2++) {
        console.log('  ['+(j2+1)+'] '+JSON.stringify(sl[j2].substring(0,100)));
      }
    }
    break;
  }
}

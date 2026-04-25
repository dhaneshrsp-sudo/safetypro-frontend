const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27 - starts at line 9680
// Find the (function(){ which is where real code starts
let iifeLineIdx = -1;
for (let i = 9679; i < 9695; i++) {
  if (lines[i] && lines[i].trim() === '(function(){') {
    iifeLineIdx = i;
    break;
  }
}
console.log('IIFE found at line:', iifeLineIdx+1);

// Clear all lines between <script> tag (line 9680) and (function({
for (let i = 9680; i < iifeLineIdx; i++) {
  if (lines[i].trim() !== '') {
    console.log('Clearing L'+(i+1)+':', lines[i].trim().substring(0,50));
    lines[i] = '';
  }
}

content = lines.join('\n');

// Verify script #27 now parses
const s27Start = 9679;
let s27End = -1;
for (let i = s27Start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}
const sc = lines.slice(s27Start+1, s27End).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = sc.split('\n');
  console.log('S27 STILL ERR at line', ln, ':', e.message);
  for(let i=Math.max(0,ln-2);i<Math.min(sl.length,ln+2);i++) console.log(' ['+(i+1)+']:', sl[i].substring(0,80));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

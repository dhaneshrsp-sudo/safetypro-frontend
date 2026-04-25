const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');
// Normalize to LF only
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = html.split('\n');

// script[20] starts at line 9680 (0-indexed), content at 9680
// script[23] starts at line 10743 (0-indexed), content at 10743
const ranges = [[9680, 10261], [10742, 10939]];
let fixed = 0;

ranges.forEach(function(r) {
  for(let i = r[0]; i < r[1]-1; i++) {
    const L = lines[i].trimEnd();
    const next = lines[i+1] ? lines[i+1].trim() : '';
    // Fix trailing + before } (with any indentation)
    if(L.endsWith('+') && next === '}') {
      console.log('Fixed L'+(i+1)+': '+L.substring(0,70));
      lines[i] = L.slice(0,-1);
      fixed++;
    }
  }
});

console.log('Fixed:', fixed);
if(fixed > 0) {
  fs.writeFileSync(path, Buffer.from(lines.join('\n'), 'utf8'));
  console.log('Saved. Size:', lines.join('\n').length);
}

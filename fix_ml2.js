const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');

// Fix multiline strings around lines 9875-9878
// L9875 (idx 9874): ends with open string + literal newline
// L9876 (idx 9875): starts with ;\n
// Join them
for(let i=9870; i<9885; i++) {
  if(!lines[i]) continue;
  const L = lines[i];
  // Count single quotes to detect unclosed strings
  let q=0;
  for(let j=0;j<L.length;j++) if(L[j]==="'") q++;
  if(q%2!==0 && i+1<lines.length) {
    console.log('Joining L'+(i+1)+' with L'+(i+2));
    console.log('  L'+( i+1)+':', L.substring(0,80));
    console.log('  L'+(i+2)+':', lines[i+1].substring(0,80));
    lines[i] = L + '\\n' + lines[i+1];
    lines[i+1] = '';
  }
}

c = lines.join('\n');
fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Done. Size:', c.length);
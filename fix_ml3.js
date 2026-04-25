const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');

// Lines 9875-9878 (0-indexed: 9874-9877)
// L9875 ends with open string (literal newline)
// Need to join with next lines properly
console.log('Before:');
for(let i=9873;i<9880;i++) console.log('L'+(i+1)+':', JSON.stringify(lines[i]));

// Fix: the multiline string spans lines 9875-9878
// L9875: "    data += ...toLocaleString('en-IN')+'\n" (literal \n at end = open string)
// L9876: "" (empty - was joined)
// L9877: "" (empty)
// L9878: ";\n  });" (starts with ; = closing of the broken string)

// The actual issue: L9875 ends with an open string literal
// We need to close it properly
if(lines[9874].endsWith("'\\n")) {
  lines[9874] = lines[9874] + "';\n    if(t.note) data += '   Note: '+t.note+'\\n';";
  lines[9875] = '';
  lines[9876] = '';
  lines[9877] = '  });';
  console.log('\nFixed!');
  console.log('New L9875:', JSON.stringify(lines[9874]));
}

c = lines.join('\n');
fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Done. Size:', c.length);
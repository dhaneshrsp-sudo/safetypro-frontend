const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');

// Show exact L9875
console.log('L9875:', JSON.stringify(lines[9874]));
console.log('L9876:', JSON.stringify(lines[9875]));
console.log('L9877:', JSON.stringify(lines[9876]));
console.log('L9878:', JSON.stringify(lines[9877]));

// Completely replace lines 9875-9878 with correct code
lines[9874] = "    data += (i+1)+'. '+t.action+' by '+t.by+(t.role?' ('+t.role+')':'')+' - '+new Date(t.timestamp).toLocaleString('en-IN')+'\\n';";
lines[9875] = "    if(t.note) data += '   Note: '+t.note+'\\n';";
lines[9876] = '  });';
lines[9877] = '';

console.log('Fixed L9875:', JSON.stringify(lines[9874]));

c = lines.join('\n');
fs.writeFileSync(path, Buffer.from(c, 'utf8'));
console.log('Done. Size:', c.length);
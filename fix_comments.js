const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixes = 0;

// Fix: lines that start with u2550 or u550 (not inside /* */) followed by */ 
// These are closing comment lines that are broken — need to start with /*
for (let i = 9675; i < 11200; i++) {
  if (!lines[i]) continue;
  const t = lines[i].trim();
  // Line that is just u2550u550... */ — closing line of broken comment
  if (t.match(/^u2550u[0-9a-f]+/) && t.endsWith('*/')) {
    lines[i] = '/* ' + lines[i];
    console.log('Fix: Added /* to closing comment at line', i+1);
    fixes++;
  }
  // Line that starts with u550u550... */ 
  if (t.match(/^u550u[0-9a-f]+/) && t.endsWith('*/')) {
    lines[i] = '/* ' + lines[i];
    console.log('Fix: Added /* to u550 closing comment at line', i+1);
    fixes++;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('Total fixes:', fixes);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

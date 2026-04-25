const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix all unclosed /* === lines that don't have */ on same line
let fixes = 0;
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('/*') && !t.endsWith('*/') && t.match(/={10,}/)) {
    lines[i] = lines[i] + ' */';
    console.log('Fix L'+(i+1)+':', lines[i].trim().substring(0,50));
    fixes++;
  }
}
console.log('Total fixes:', fixes);
content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

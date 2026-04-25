const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixes = 0;

// Replace all lines that are just u550/u2550 patterns (broken unicode box chars)
// with clean ASCII comment separators
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  // Matches lines that are mostly u550 or u2550 patterns (comment separator lines)
  if (t.match(/^\/?\*?\s*u[0-9a-f]{3,4}(u[0-9a-f]{3,4}){5,}/) || 
      t.match(/^u[0-9a-f]{3,4}(u[0-9a-f]{3,4}){5,}/)) {
    // Replace with clean separator
    if (t.endsWith('*/') || t.includes('*/')) {
      lines[i] = '/* ================================================================ */';
    } else if (t.startsWith('/*')) {
      lines[i] = '/* ================================================================';
    } else {
      lines[i] = '   ================================================================';
    }
    fixes++;
  }
}

console.log('Fixed separator lines:', fixes);
content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

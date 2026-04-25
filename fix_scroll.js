const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Fix line 33 (index 32): change overflow: hidden to overflow-y: auto in .content block
if (lines[32].trim() === 'overflow: hidden;') {
  lines[32] = lines[32].replace('overflow: hidden;', 'overflow-y: auto;');
  console.log('Fixed line 33:', lines[32].trim());
} else {
  console.log('Line 33 content:', lines[32]);
  console.log('No match - checking nearby lines...');
  for (var i = 26; i <= 35; i++) console.log(i+1 + ': ' + lines[i]);
}

const buf = Buffer.from(lines.join('\n'), 'utf8');
fs.writeFileSync(path, buf);

const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

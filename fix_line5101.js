const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Line 5101 (index 5100): fix orphaned </body></html>';
if (lines[5100].trim() === "</body></html>';") {
  lines[5100] = lines[5100].replace("</body></html>';", "+'</body></html>';");
  console.log('Fixed 5101:', lines[5100].trim());
} else {
  console.log('5101 unexpected:', lines[5100].trim());
}

const buf = Buffer.from(lines.join('\n'), 'utf8');
fs.writeFileSync(path, buf);

const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

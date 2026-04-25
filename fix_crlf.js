const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');
const fixed = content.replace(/\r\n/g, '\n');
fs.writeFileSync(path, Buffer.from(fixed, 'utf8'));
const size = Buffer.from(fixed, 'utf8').length;
console.log('CRLF->LF done. Size:', size, 'First 3 bytes:', Buffer.from(fixed)[0], Buffer.from(fixed)[1], Buffer.from(fixed)[2]);
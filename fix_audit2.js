const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const fixed = lines.filter(line => !line.includes("+'" + '\n' + '<script id="ac-user-fix"'));

// Also filter the exact string with literal \n
const fixed2 = fixed.filter(line => !(line.includes("+'" + '\\n<script id="ac-user-fix"')));

const buf = Buffer.from(fixed2.join('\n'), 'utf8');
fs.writeFileSync(path, buf);

const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Lines removed:', lines.length - fixed2.length);
console.log('Size:', check.length);

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Check: what do HTML lines 9735-9737 look like when joined?
const joined = lines.slice(9735, 9738).join('\n');
console.log('Joined length:', joined.length);
console.log('L9736 length:', lines[9735].length);
console.log('L9737 length:', lines[9736].length);
console.log('L9738 length:', lines[9737].length);

// Check raw bytes between L9736 and L9737
const L9736 = lines[9735];
const lastChars = [];
for (let i = L9736.length-5; i < L9736.length; i++) lastChars.push(L9736.charCodeAt(i));
console.log('L9736 last 5 codes:', lastChars.join(','));

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix all n-prefix corruptions
let count = 0;

// nvar -> var
const nvarCount = (content.match(/\nnvar /g) || []).length;
content = content.replace(/\nnvar /g, '\nvar ');
console.log('Fixed nvar:', nvarCount);

// nwindow -> window (in case any remain)
const nwinCount = (content.match(/\nnwindow\./g) || []).length;
content = content.replace(/\nnwindow\./g, '\nwindow.');
console.log('Fixed nwindow:', nwinCount);

// nif -> if
const nifCount = (content.match(/\nnif /g) || []).length;
content = content.replace(/\nnif /g, '\nif ');
console.log('Fixed nif:', nifCount);

// nfunction -> function
const nfnCount = (content.match(/\nnfunction /g) || []).length;
content = content.replace(/\nnfunction /g, '\nfunction ');
console.log('Fixed nfunction:', nfnCount);

// nreturn -> return
const nretCount = (content.match(/\nnreturn /g) || []).length;
content = content.replace(/\nnreturn /g, '\nreturn ');
console.log('Fixed nreturn:', nretCount);

// n/* comment prefix
const ncmtCount = (content.match(/\nn\/\*/g) || []).length;
content = content.replace(/\nn\/\*/g, '\n/*');
console.log('Fixed n/*:', ncmtCount);

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

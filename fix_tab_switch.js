const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Remove #ac-ims display:block from CSS (breaks tab switching)
content = content.replace('#ac-ims{display:block!important;}', '#ac-ims.active{display:block!important;}');
console.log('Fix 1: CSS updated');

// Fix 2: Remove display:block from cssText in scroll fix JS
content = content.replace(
  "ims.style.cssText = 'flex:1;min-height:0;display:block;overflow:visible;'; ims.style.overflowY='auto';",
  "ims.style.overflow='visible'; ims.style.overflowY='auto';"
);
console.log('Fix 2: cssText fixed');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

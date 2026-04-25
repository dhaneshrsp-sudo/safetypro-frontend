const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix the corrupted pipeline renderer on line 9736
// The broken pattern: );'+"" (isPast?'\u2713':(i+1))
// Should be: );'+(isPast?'\u2713':(i+1))
const broken = `);'+""`; 
const fixed = `);'+`;
if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  console.log('Fixed: removed stray "" concatenation');
} else {
  console.log('Pattern not found - checking...');
  const idx = content.indexOf('isPast?');
  const ctx = content.slice(Math.max(0,idx-30), idx+40);
  console.log('Context:', ctx);
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

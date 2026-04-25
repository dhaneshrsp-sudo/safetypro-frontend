const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix the broken ternary on line 9736
// Broken: :'var(--t3)');'+(isPast?
// Fixed:  :'var(--t3)')+'+(isPast?
// Actually looking at it: the string ends with ;' which is wrong
// The pattern is color:'+(isCur?st.color:'var(--t3)');'+(isPast?
// Should be:          color:'+(isCur?st.color:'var(--t3)')+'+(isPast?

const broken = ":'var(--t3)');'+(isPast?";
const fixed  = ":'var(--t3)')+'+(isPast?";

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  console.log('Fixed broken ternary');
} else {
  console.log('Pattern not found');
  // Check what's around var(--t3)
  const idx = content.indexOf("var(--t3)");
  while (idx > 0) {
    // find multiple occurrences
    break;
  }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

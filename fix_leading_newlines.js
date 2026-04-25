const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Lines 9680 and 9681 should both be empty - remove them
// Script #27 starts at index 9679 (<script>) 
// Then 9680 and 9681 are empty lines before (function(){
let removed = 0;
for (let i = 9679; i < 9683; i++) {
  if (lines[i] && lines[i].trim() === '') {
    // Check if next non-empty line is (function(){
    const next = lines.slice(i+1).find(l => l.trim() !== '');
    if (next && next.trim() === '(function(){') {
      console.log('Removing empty line at', i+1);
      lines.splice(i, 1);
      removed++;
      i--; // recheck same index
    }
  }
}
console.log('Removed', removed, 'empty lines');

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

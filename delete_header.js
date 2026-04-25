const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Delete lines 9681-9685 (bare text header lines)
// These are index 9680-9684
let deleted = 0;
for (let i = 9679; i <= 9684; i++) {
  const t = lines[i].trim();
  if (t.match(/SafetyPro/) || t.match(/^\/\/\s+\d+\./) || t.match(/^\/\/\s+ISO/) || 
      t.match(/^\/\/\s+\d\. /) || t.match(/^  \d\. /) || t.match(/^  ISO /) ||
      t.match(/^  SafetyPro/) || t.match(/^  Approval/) || t.match(/^  AI Root/)) {
    console.log('Deleting L'+(i+1)+':', lines[i].substring(0,60));
    lines[i] = '';
    deleted++;
  }
}

// Also fix second block around 9689-9691
for (let i = 9688; i <= 9692; i++) {
  const t = lines[i].trim();
  if (t.match(/^\/\/\s+\d\. /) || t.match(/^\/\/\s+States/) || t.match(/^  \d\. /) || t.match(/^  States/)) {
    console.log('Deleting L'+(i+1)+':', lines[i].substring(0,60));
    lines[i] = '';
    deleted++;
  }
}

console.log('Deleted', deleted, 'lines');
content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

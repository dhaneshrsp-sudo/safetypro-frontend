const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find <script> tag at line 9681 (index 9680)
// Delete all lines between <script> and (function(){ 
let inScript = false;
let foundIIFE = false;
let deleted = 0;

for (let i = 9679; i < 9695; i++) {
  const t = lines[i].trim();
  if (t === '<script>') { inScript = true; continue; }
  if (!inScript) continue;
  if (t.startsWith('(function(') || t === "'use strict';" ) { foundIIFE = true; }
  if (foundIIFE) break;
  // Delete anything that's not essential code
  if (t !== '' && !t.startsWith('//') && !t.startsWith('/*') && !t.startsWith('*') && t !== '*/') {
    console.log('Clearing L'+(i+1)+'('+lines[i].length+'):', t.substring(0,60));
    lines[i] = '';
    deleted++;
  }
}

console.log('Deleted:', deleted);
content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

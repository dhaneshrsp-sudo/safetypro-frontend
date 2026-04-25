const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i+1;break;} }
for (let i = s27Start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;} }

let removed = 0;
for (let i = s27Start; i < s27End; i++) {
  const t = lines[i].trim();
  // Remove ALL /* === */ separator lines inside script #27
  if (t.match(/^\/\* [=]{5,} \*\/$/) || t.match(/^\/\* [=]{5,}\.\.\. \*\/$/)) {
    lines[i] = '';
    removed++;
  }
}
console.log('Removed', removed, 'separator lines');

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i+1; break; }
}
for (let i = s27Start; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}

// Scan every line for non-ASCII or suspicious chars
let issues = 0;
for (let i = s27Start; i < s27End; i++) {
  const l = lines[i];
  for (let j = 0; j < l.length; j++) {
    const c = l.charCodeAt(j);
    if (c > 127) {
      console.log('NON-ASCII L'+(i+1)+' col'+(j+1)+' code='+c+'('+l[j]+'): '+l.substring(Math.max(0,j-10),j+10));
      issues++;
      break; // one per line
    }
  }
}
console.log('Total non-ASCII issues:', issues);

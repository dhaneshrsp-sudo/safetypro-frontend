const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Extract script #27 body
let start = -1, end = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { start = i+1; break; }
}
for (let i = start; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { end = i; break; }
}

const sl = lines.slice(start, end);
console.log('Script body: lines', start+1, 'to', end, '=', sl.length, 'lines');

// Show lines 9-20 of script
for (let i=8; i<20; i++) {
  if (sl[i] !== undefined) console.log('SL'+(i+1)+'('+sl[i].length+'):', sl[i].substring(0,100));
}

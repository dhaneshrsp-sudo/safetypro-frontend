const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Show lines 9733-9742 with carriage return detection
for (let i = 9732; i <= 9741; i++) {
  const l = lines[i];
  const hasCR = l.endsWith('\r');
  const lastChar = l.charCodeAt(l.length-1);
  console.log('L'+(i+1)+'('+l.length+') CR='+hasCR+' lastCode='+lastChar+':', l.replace(/\r/g,'<CR>').substring(0,80));
}

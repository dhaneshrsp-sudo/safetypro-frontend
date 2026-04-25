const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Show full content of INC_STATES lines (9689-9700)
for (let i = 9689; i <= 9700; i++) {
  const l = lines[i];
  console.log('L'+(i+1)+'('+l.length+'):', JSON.stringify(l));
}

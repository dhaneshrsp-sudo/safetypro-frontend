const fs = require('fs');
const c = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html','utf8');
const lines = c.split('\n');
for(let i=9870;i<9885;i++) {
  console.log('L'+(i+1)+'('+lines[i].length+'):', JSON.stringify(lines[i].substring(0,100)));
}
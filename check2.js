const fs = require('fs');
const c = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html','utf8');
const lines = c.split('\n');
for(let i=9934;i<9945;i++) console.log('L'+(i+1)+'('+lines[i].length+'):', JSON.stringify(lines[i].substring(0,120)));
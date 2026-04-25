const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Show current state of SL2-SL8 (lines 9681-9688)
for (let i=9680;i<9690;i++) console.log('L'+(i+1)+'('+lines[i].length+'):', JSON.stringify(lines[i].substring(0,80)));

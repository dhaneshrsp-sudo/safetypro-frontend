const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Check lines 9720-9725 and 10910-10915 exact content
console.log('=== Around line 9722 ===');
for (let i = 9715; i <= 9730; i++) {
  console.log((i+1) + '|' + JSON.stringify(lines[i]));
}

console.log('\n=== Around line 10913 ===');
for (let i = 10905; i <= 10920; i++) {
  console.log((i+1) + '|' + JSON.stringify(lines[i]));
}

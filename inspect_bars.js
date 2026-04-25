const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Show Bar 2 block (lines 1618-1730)
console.log('=== BAR 2 (lines 1618-1730) ===');
for (let i = 1617; i <= 1729; i++) {
  if (lines[i] !== undefined) console.log((i+1) + ': ' + lines[i].substring(0, 100));
}

// Show Bar 3 block (lines 1803-1920)
console.log('\n=== BAR 3 (lines 1803-1920) ===');
for (let i = 1802; i <= 1919; i++) {
  if (lines[i] !== undefined) console.log((i+1) + ': ' + lines[i].substring(0, 100));
}

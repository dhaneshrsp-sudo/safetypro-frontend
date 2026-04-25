const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Line 9681 is "  SafetyPro u014..." - bare text before first comment
// Line 9682 is "  1. Approval..." - bare text  
// Line 9683 is "  2. AI Root Cause..." - bare text
// Line 9684 is "  ISO 45001..." - bare text
// These need to be commented out
const targets = [9680, 9681, 9682, 9683];
targets.forEach(function(idx) {
  if (lines[idx] && !lines[idx].trim().startsWith('//') && !lines[idx].trim().startsWith('/*') && lines[idx].trim() !== '') {
    lines[idx] = '//' + lines[idx];
    console.log('Commented line', idx+1, ':', lines[idx].substring(0,60));
  }
});

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

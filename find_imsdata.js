const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find what variable name IMS_DATA uses
const lines = content.split('\n');
let imsDataVar = '';
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/var IMS_DATA\s*=|window\.IMS_DATA\s*=|IMS_DATA\s*=\s*\[/)) {
    console.log('Found IMS_DATA at line ' + (i+1) + ': ' + lines[i].substring(0,80));
    imsDataVar = lines[i].trim().substring(0,80);
    break;
  }
}

// Also check for AUDIT_DATA or similar
for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/var AUDIT_DATA|var auditData|window\.auditData/)) {
    console.log('Alt data at line ' + (i+1) + ': ' + lines[i].substring(0,80));
  }
}

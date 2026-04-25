const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix line 9737 - the style string terminator issue
// ';"' inside a JS string delimited by ' will NOT cause issues
// But looking at it: '"'+stateLabels - the +"  starts a string with double quote
// The issue is ';"'+ is correct (single quote delimited)
// Check what's actually there
const lines = content.split('\n');
const L = lines[9736];
console.log('L9737 full:', JSON.stringify(L));

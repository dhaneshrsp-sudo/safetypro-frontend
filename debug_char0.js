const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script #27 starts at line 9680 (<script>)
// First line of CONTENT is line 9681 (index 9680)
const firstContentLine = lines[9680];
const codes = [];
for (let i = 0; i < firstContentLine.length; i++) {
  codes.push(firstContentLine.charCodeAt(i));
}
console.log('Line 9681 content:', JSON.stringify(firstContentLine.substring(0,50)));
console.log('Char codes:', codes.join(','));

// Test: is it the comment itself that fails?
const testScript = firstContentLine;
try { new Function(testScript); console.log('Single line: OK'); }
catch(e) { console.log('Single line error:', e.message); }

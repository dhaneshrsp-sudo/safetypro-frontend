const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script body starts after <script> tag at line 9680 (index 9679)
let s27Start = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i+1; break; }
}

// Show EXACT first character
const firstLine = lines[s27Start];
console.log('s27Start line index:', s27Start);
console.log('First line length:', firstLine.length);
console.log('First line raw:', JSON.stringify(firstLine));

// Test just first line
try { new Function(firstLine); console.log('First line: OK'); }
catch(e) { console.log('First line ERR:', e.message); }

// Test empty string
try { new Function(''); console.log('Empty: OK'); }
catch(e) { console.log('Empty ERR:', e.message); }

// Check if there's something between <script> and newline
const scriptTagLine = lines[9679];
console.log('Script tag line raw:', JSON.stringify(scriptTagLine));

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Browser says line 9722 col 3 and line 10913 col 0
// These are HTML file line numbers. Let's look at exact content.

// Check if there's a script tag that starts and the error is at HTML line 9722
// Find all <script> starts and their HTML line numbers
let scriptStarts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<script') && !lines[i].includes('src=') && !lines[i].includes('src =')) {
    scriptStarts.push(i+1); // 1-indexed
  }
}
console.log('Script tag starts at HTML lines:', scriptStarts.slice(20,36));

// Check line 9741 (new error "Unexpected identifier u713")
console.log('\nLine 9741:', JSON.stringify(lines[9740]));
console.log('Line 9742:', JSON.stringify(lines[9741]));
console.log('Line 9740:', JSON.stringify(lines[9739]));

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find and fix the broken comment header in script #27 (around line 9680)
// The structure is:
// /* ===... (unclosed)
// //  SafetyPro content
// //  lines...
// /* ===... */
// We need to make this one proper block comment

for (let i = 9679; i < 9695; i++) {
  if (!lines[i]) continue;
  // Find the opening /* === line (no closing */)
  if (lines[i].match(/^\/\* ={10,}$/) || lines[i].match(/^\/\* u550/)) {
    // Check if next few lines are // comments
    let j = i + 1;
    let docLines = [];
    while (j < i + 10 && lines[j] && (lines[j].trim().startsWith('//') || lines[j].trim() === '')) {
      docLines.push(j);
      j++;
    }
    // Check if we then hit a /* === */ closing line
    if (lines[j] && (lines[j].match(/^\/\* ={10,} \*\/$/) || lines[j].match(/^\/\* u2550/))) {
      // Fix: remove the // prefixes from doc lines — they're already inside /* */
      docLines.forEach(function(idx) {
        if (lines[idx].startsWith('//')) {
          lines[idx] = lines[idx].substring(2); // remove //
        }
      });
      console.log('Fixed comment block at lines', i+1, 'to', j+1);
    }
    break;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

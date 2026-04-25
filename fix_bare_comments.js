const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixes = 0;

// Find bare lines between comment blocks that should be inside comments
// These are lines that contain plain text like "SafetyPro u014..." or "1. Approval..."
// and are inside script blocks (between script tags around line 9680)
for (let i = 9679; i < 10050; i++) {
  if (!lines[i]) continue;
  const t = lines[i].trim();
  
  // Lines that look like documentation text (not code) that are not already comments
  const isDocLine = 
    (t.match(/^SafetyPro u[0-9a-f]+ /) ||  // SafetyPro u014 ...
     t.match(/^\d+\. /) ||                   // 1. something
     t.match(/^ISO \d+/) ||                  // ISO 45001...
     t.match(/^States: /) ||                 // States: ...
     t.match(/^SheetJS /) ||                 // SheetJS reader...
     t.match(/^5\. BULK/) ||                 // 5. BULK IMPORT
     t.match(/^INCIDENT APPROVAL/) ||        // INCIDENT APPROVAL
     t.match(/^AI Root Cause/) ||            // AI Root Cause
     t.match(/^Approval Workflow/));         // Approval Workflow
  
  const isAlreadyComment = t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
  
  if (isDocLine && !isAlreadyComment) {
    lines[i] = '//' + lines[i];
    console.log('Fix: Commented line', i+1, ':', t.substring(0,50));
    fixes++;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('Total fixes:', fixes);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

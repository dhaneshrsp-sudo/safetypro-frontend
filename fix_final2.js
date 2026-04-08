const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Find the ROR script block starting position
const rorMarker = '/* ror-legal-compliance-v1 */';
const rorPos = h.indexOf(rorMarker);
console.log('ROR script found at pos:', rorPos);

// Find </script> that might be inside our ROR JS strings
// The rorExport function generates HTML with <script> tags inside strings
// These </script> inside strings terminate the HTML script block prematurely
// Fix: escape them as <\/script>

// Find the script block containing the ROR marker
const scriptOpen = h.lastIndexOf('<script>', rorPos);
const scriptClose = h.indexOf('</script>', rorPos);
console.log('ROR script block:', scriptOpen, 'to', scriptClose);

const before = h.substring(0, scriptOpen + 8);
let rorContent = h.substring(scriptOpen + 8, scriptClose);
const after = h.substring(scriptClose);

// Check for </script> inside strings in the ROR content
const closeTagCount = (rorContent.match(/<\/script>/g)||[]).length;
console.log('</script> inside ROR content:', closeTagCount);

// Escape them
rorContent = rorContent.replace(/<\/script>/g, '<\\/script>');
rorContent = rorContent.replace(/<script>/g, '<\\/script><script>');

h = before + rorContent + after;

// Also fix MTG script - find the unclosed string pattern
// The MTG script ends with +'</div> (no closing quote) then blank lines then <script>
// Fix it by finding all lines ending with +'</div> without closing quote
const lines = h.split('\n');
for(let i=0;i<lines.length;i++){
  const t = lines[i].trimEnd();
  if(t.endsWith("+'</div>") && i+1 < lines.length && lines[i+1].trim()==='') {
    console.log('Found MTG broken line at', i+1, ':', t.substring(t.length-20));
    lines[i] = lines[i].replace("+'</div>", "+'</div>';");
    break;
  }
}
h = lines.join('\n');

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('Done. Size:', Math.round(h.length/1024)+'KB');

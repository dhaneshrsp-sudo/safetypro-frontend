const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// The ROR JS is currently embedded INSIDE another script's string
// We need to:
// 1. Remove ROR JS from its current wrong position
// 2. Re-inject it just before </body>

const rorMarker = '/* ror-legal-compliance-v1 */';
const rorPos = h.indexOf(rorMarker);
const scriptOpen = h.lastIndexOf('<script>', rorPos);
const scriptClose = h.indexOf('</script>', rorPos) + 9;

// The correct position: the string before <script> in the same line
// It looks like: '</div><script>\n/* ror... */
// We need to extract just the ROR script content and re-add it cleanly

// Get the full wrong context
const wrongContext = h.substring(scriptOpen - 20, scriptOpen + 20);
console.log('Wrong context:', JSON.stringify(wrongContext));

// The script block containing ROR runs from scriptOpen to scriptClose
const rorBlock = h.substring(scriptOpen, scriptClose);

// Remove the <script> part from the string before it  
// The string ends with '</div> then <script> starts
// We need to: close the string properly AND remove the <script> from inside string
const fixedBefore = h.substring(0, scriptOpen).replace(/'<\/div>$/, "'</div>'");
const fixedMiddle = '\n\n<\/script>\n\n'; // close the broken outer script, then our ROR block

// Reconstruct
h = fixedBefore + fixedMiddle + rorBlock + h.substring(scriptClose);

// Verify
console.log('ROR now at correct position:', h.indexOf(rorMarker) > 0);
console.log('Context before ROR:', JSON.stringify(h.substring(h.indexOf(rorMarker)-30, h.indexOf(rorMarker))));

fs.writeFileSync('safetypro_audit_compliance.html', h);

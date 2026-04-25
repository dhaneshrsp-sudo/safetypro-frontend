const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');
let fixed = 0;

// Find lines inside script #27 that end with ' and the next line continues a string
for (let i = 9679; i < 9900; i++) {
  const L = lines[i];
  // Line ends with open string: ends with +' or +'  
  // or line has odd number of single quotes suggesting unclosed string
  if (!L) continue;
  
  // Check if this line has trailing content after last ' that looks like start of new JS line
  // Pattern: line ends without closing the string properly
  // Simple heuristic: count single quotes - if odd, there's an unclosed string
  // Actually let's just look for lines that end with \n inside a string literal
  
  // Find lines that have a newline embedded (literal \n at end before semicolon)
  if (L.endsWith("';") && lines[i-1] && !lines[i-1].endsWith('+')) {
    // This might be a continuation of a multiline string
    // Check if prev line ends without closing quote
  }
}

// Better approach: find all consecutive lines that form a broken multiline string
// Pattern: line ends with ' followed by newline and next line starts in middle of expression
let joined = 0;
for (let i = 9679; i < 9900; i++) {
  if (!lines[i]) continue;
  const L = lines[i];
  // If line ends with ' (open string at end) and next non-empty line starts with expression
  if (L.endsWith("'") || L.endsWith("'+")) continue; // these are fine continuations
  
  // Check: does this line end in the middle of a string literal?
  // Count unescaped single quotes
  let inStr = false, quotes = 0;
  for (let j = 0; j < L.length; j++) {
    if (L[j] === "'") { quotes++; inStr = !inStr; }
  }
  if (quotes % 2 !== 0) {
    // Odd quotes - string is unclosed
    // Join this line with next line using \n
    if (i+1 < lines.length && lines[i+1]) {
      console.log('Found unclosed string at L'+(i+1)+': '+L.substring(0,80));
      lines[i] = L + '\\n' + lines[i+1];
      lines[i+1] = '';
      joined++;
    }
  }
}
console.log('Joined:', joined);

c = lines.join('\n');
fs.writeFileSync(path, Buffer.from(c, 'utf8'));
console.log('Size:', c.length);
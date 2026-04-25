const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27: line 9680 is <script>, 9681 is empty, 9682 is (function(){
// Move (function(){ to same line as <script> to eliminate leading newlines
const scriptTagIdx = 9679; // 0-indexed = HTML line 9680

if (lines[scriptTagIdx].trim() === '<script>') {
  // Find first non-empty line after <script>
  let codeStart = -1;
  for (let i = scriptTagIdx+1; i < scriptTagIdx+5; i++) {
    if (lines[i] && lines[i].trim() !== '') { codeStart = i; break; }
  }
  if (codeStart > -1 && lines[codeStart].trim() === '(function(){') {
    console.log('Merging script tag with (function(){ at lines', scriptTagIdx+1, 'and', codeStart+1);
    lines[scriptTagIdx] = '<script>';
    // Clear empty lines between <script> and code
    for (let i = scriptTagIdx+1; i < codeStart; i++) {
      lines[i] = '';
    }
    console.log('Cleared', codeStart - scriptTagIdx - 1, 'empty lines');
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

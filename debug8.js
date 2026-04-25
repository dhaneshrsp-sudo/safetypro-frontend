const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Extract script #27 content (lines 9681-end of script)
let scriptStart = 9680; // index of <script> tag
let scriptEnd = -1;
for (let i = scriptStart+1; i < lines.length; i++) {
  if (lines[i].trim() === '</script>') { scriptEnd = i; break; }
}
console.log('Script from line', scriptStart+1, 'to', scriptEnd+1);

const scriptContent = lines.slice(scriptStart+1, scriptEnd).join('\n');
const firstLines = scriptContent.split('\n').slice(0,10);
console.log('First 10 lines of script content:');
firstLines.forEach(function(l,i){ console.log((i+1)+': ['+l.length+'] '+l.substring(0,80)); });

// Test parse first 10 lines
const test = firstLines.join('\n');
try { new Function(test); console.log('FIRST 10 LINES: VALID'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  console.log('FIRST 10 LINES ERROR at line', m?m[1]:'?', ':', e.message);
}

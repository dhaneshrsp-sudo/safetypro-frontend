const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find script #27 boundaries
let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) {
  if (lines[i] && lines[i].trim() === '<script>') { s27Start = i; break; }
}
for (let i = s27Start+1; i < 10220; i++) {
  if (lines[i] && lines[i].trim() === '</script>') { s27End = i; break; }
}

// Extract script body and find exact error location
let scriptLines = lines.slice(s27Start+1, s27End);
let failAt = -1, failErr = '';
for (let n = 2; n <= scriptLines.length; n++) {
  try { new Function(scriptLines.slice(0,n).join('\n')); }
  catch(e) {
    if (!e.message.includes('end of input') && !e.message.includes('closing')) {
      const m = e.stack.match(/anonymous>:(\d+)/);
      failAt = n;
      failErr = e.message;
      const errLine = m ? parseInt(m[1]) - 1 : n - 1;
      console.log('FAIL at script line', n, '| JS error at line', errLine+1, ':', e.message);
      // Show surrounding lines
      for (let i = Math.max(0, errLine-2); i <= Math.min(scriptLines.length-1, errLine+2); i++) {
        console.log('  ['+(i+1)+']:', JSON.stringify(scriptLines[i].substring(0,100)));
      }
      break;
    }
  }
}

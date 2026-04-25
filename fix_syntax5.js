const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
let fixes = 0;

// Fix 1: Line 9694 - indow.INC_AUDIT -> window.INC_AUDIT
for (let i = 9690; i < 9700; i++) {
  if (lines[i] && lines[i].startsWith('indow.INC_AUDIT')) {
    lines[i] = 'window.INC_AUDIT' + lines[i].slice('indow.INC_AUDIT'.length);
    console.log('Fix 1: Fixed indow.INC_AUDIT at line', i+1); fixes++;
  }
}

// Fix 2: Script #32 at line 10896 - missing })() closing
// The script is: (function(){ ... }, 100); };
// It should end with })();
for (let i = 10893; i < 10898; i++) {
  if (lines[i] && lines[i].trim() === '(function(){') {
    // Find the closing }; of this script
    for (let j = i+1; j < i+30; j++) {
      if (lines[j] && lines[j].trim() === '};') {
        // Check if the script inside has setTimeout pattern
        const block = lines.slice(i, j+1).join('\n');
        if (block.includes('}, 100);')) {
          // The }, 100); closes setTimeout, and }; closes the function
          // Actually structure is: (function(){ setTimeout(function(){ ... }, 100); });
          // Fix: change }; to })();
          lines[j] = '})();';
          console.log('Fix 2: Fixed script #32 closing at line', j+1); fixes++;
        }
        break;
      }
    }
    break;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('Total fixes:', fixes);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

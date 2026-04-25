const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

let fixes = 0;

for (let i = 9700; i < 9740; i++) {
  if (!lines[i]) continue;
  
  // Fix missing 'w' in window. prefix
  if (lines[i].match(/^indow\./)) {
    lines[i] = 'w' + lines[i];
    console.log('Fixed window. at line', i+1);
    fixes++;
  }
  
  // Fix missing closing bracket and semicolon after return statement
  if (lines[i].trim() === "';") {
    // Check if previous line has unclosed function
    if (lines[i-1] && lines[i-1].includes('return') && !lines[i-1].includes('};')) {
      lines[i] = lines[i] + '\n};';
      console.log('Fixed missing }; at line', i+1);
      fixes++;
    }
  }
  
  // Fix n  /* pattern
  if (lines[i].match(/^n  \/\*/)) {
    lines[i] = lines[i].replace(/^n  \/\*/, '  /*');
    console.log('Fixed n  /* at line', i+1);
    fixes++;
  }
}

// Also fix the HTML string on line 9713 - missing > before st.label
for (let i = 9710; i < 9716; i++) {
  if (lines[i] && lines[i].includes("'+st.label+'</span>'") && !lines[i].includes(">'+st.label")) {
    lines[i] = lines[i].replace("''+st.label+'</span>'", "'>'+st.label+'</span>'");
    console.log('Fixed missing > at line', i+1);
    fixes++;
  }
}

// Fix line 9714 - add missing };
for (let i = 9712; i < 9717; i++) {
  if (lines[i] && lines[i].trim() === ';') {
    lines[i] = '};';
    console.log('Fixed missing }; at line', i+1);
    fixes++;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('Total fixes:', fixes);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

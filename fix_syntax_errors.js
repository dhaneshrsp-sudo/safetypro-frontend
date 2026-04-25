const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix 1: Remove scroll-enforcer injected inside JS string (line 4740)
const seStart = content.indexOf('<script id="scroll-enforcer">');
if (seStart > -1) {
  const seEnd = content.indexOf('</script>', seStart) + 9;
  content = content.slice(0, seStart) + content.slice(seEnd);
  console.log('Fix 1: Removed scroll-enforcer');
} else {
  console.log('Fix 1: scroll-enforcer not found (already removed)');
}

// Fix 2: Fix broken IIFE at line 9697 — find exact pattern
// The broken line is literally: function(){\n  use strict';
const broken2a = "function(){\nuse strict';";
const broken2b = "function(){\n  use strict';";
const broken2c = "function(){\r\nuse strict';";
const broken2d = "function(){\r\n  use strict';";
const fixed2 = "(function(){\n'use strict';";

if (content.includes(broken2a)) {
  content = content.replace(broken2a, fixed2);
  console.log('Fix 2a: Fixed IIFE');
} else if (content.includes(broken2b)) {
  content = content.replace(broken2b, fixed2);
  console.log('Fix 2b: Fixed IIFE');
} else if (content.includes(broken2c)) {
  content = content.replace(broken2c, fixed2);
  console.log('Fix 2c: Fixed IIFE');
} else if (content.includes(broken2d)) {
  content = content.replace(broken2d, fixed2);
  console.log('Fix 2d: Fixed IIFE');
} else {
  // Manual line fix
  const linesArr = content.split('\n');
  for (let i = 9690; i < 9705; i++) {
    if (linesArr[i] && linesArr[i].trim() === "function(){") {
      linesArr[i] = linesArr[i].replace("function(){", "(function(){");
      if (linesArr[i+1] && linesArr[i+1].includes("use strict'")) {
        linesArr[i+1] = linesArr[i+1].replace("use strict'", "'use strict'");
      }
      content = linesArr.join('\n');
      console.log('Fix 2: Fixed IIFE at line', i+1);
      break;
    }
  }
}

// Fix 3: Fix 'n/*' corruption — some lines start with 'n/*' instead of '\n/*'
content = content.replace(/\nn\/\* /g, '\n/* ');
content = content.replace(/\nnwindow\./g, '\nwindow.');
console.log('Fix 3: Fixed n/* and nwindow. prefixes');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

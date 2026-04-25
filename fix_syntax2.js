const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix 1: Line 4739 — '</div> missing closing quote
// Find the line with '</div>\n\n</body></html>';
const broken1 = "'</div>\n\n</body></html>';";
const fixed1  = "'</div>\\n\\n</body></html>';";
// Actually look at what's there
let l4738 = lines[4738]; // 0-indexed = line 4739
console.log('Line 4739 raw:', JSON.stringify(l4738));

// Fix 2: Line 9701 — stray semicolon after INC_STATES closing }
let l9700 = lines[9700];
console.log('Line 9701 raw:', JSON.stringify(l9700));

// Find INC_STATES closing and fix missing }; 
// The object ends at line 9701 with just ';' — needs to be '};'
for (let i = 9695; i < 9710; i++) {
  if (lines[i] && lines[i].trim() === ';') {
    lines[i] = '};';
    console.log('Fix 2: Fixed INC_STATES closing at line', i+1);
    break;
  }
}

// Fix 1: Line 4739 — '</div> needs closing quote
for (let i = 4735; i < 4745; i++) {
  if (lines[i] && lines[i].trim() === "'</div>") {
    lines[i] = lines[i].replace("'</div>", "'</div>'");
    console.log('Fix 1: Fixed unclosed string at line', i+1);
    break;
  }
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

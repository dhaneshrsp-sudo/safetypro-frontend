const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Fix line 4739: '</div>' needs + at end to continue string
// Fix line 4741: </body></html>'; needs leading '
for (let i = 4730; i < 4750; i++) {
  if (lines[i] && lines[i].trim() === "'</div>'") {
    lines[i] = lines[i].replace("'</div>'", "'</div>' +");
    console.log('Fix A: Added + to line', i+1);
  }
  if (lines[i] && lines[i].trim() === "</body></html>';") {
    lines[i] = lines[i].replace("</body></html>';", "'</body></html>';");
    console.log('Fix B: Added opening quote to line', i+1);
  }
}

// Fix line 10913: check for stray }
for (let i = 10905; i < 10920; i++) {
  if (lines[i]) console.log('L'+(i+1)+':', JSON.stringify(lines[i].trim().substring(0,60)));
}

content = lines.join('\n');
const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

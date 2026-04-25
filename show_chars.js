const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Show lines 9681-9692 exact
for (let i = 9680; i < 9693; i++) {
  process.stdout.write((i+1) + '(' + lines[i].length + '): ');
  for (let j = 0; j < Math.min(lines[i].length, 100); j++) {
    const c = lines[i].charCodeAt(j);
    if (c < 32 || c > 126) process.stdout.write('['+c+']');
    else process.stdout.write(lines[i][j]);
  }
  process.stdout.write('\n');
}

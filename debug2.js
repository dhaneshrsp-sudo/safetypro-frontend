const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');

// Extract script #27 and #32 to find exact errors
const scriptRegex = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let match, num = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  num++;
  if (num === 27 || num === 32) {
    const sc = match[1];
    try { new Function(sc); } catch(e) {
      const m = e.stack.match(/<anonymous>:(\d+)/);
      if (m) {
        const ln = parseInt(m[1]);
        const lines = sc.split('\n');
        console.log('Script #'+num+' error: '+e.message);
        for (let i=Math.max(0,ln-3);i<Math.min(lines.length,ln+2);i++) {
          console.log('  L'+(i+1)+': '+JSON.stringify(lines[i].substring(0,100)));
        }
      }
    }
  }
}

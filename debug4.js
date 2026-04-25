const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');

// Find script #27 and #32 manually
let pos = 0, num = 0;
const tag = '<script';
while (pos < content.length) {
  const found = content.indexOf(tag, pos);
  if (found < 0) break;
  // Check if it has src=
  const tagEnd = content.indexOf('>', found);
  const tagContent = content.slice(found, tagEnd+1);
  if (!tagContent.includes('src=')) {
    num++;
    const scriptEnd = content.indexOf('</script>', found);
    const scriptContent = content.slice(tagEnd+1, scriptEnd);
    const startLine = content.slice(0, found).split('\n').length;
    if (num === 27 || num === 32) {
      try { new Function(scriptContent); console.log('Script #'+num+' at line '+startLine+': OK'); }
      catch(e) {
        console.log('Script #'+num+' at line '+startLine+': ERROR: '+e.message);
        const m = e.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (m) {
          const ln = parseInt(m[1]);
          const col = parseInt(m[2]);
          const sl = scriptContent.split('\n');
          console.log('  At script-local line '+ln+' col '+col);
          for (let i=Math.max(0,ln-3);i<Math.min(sl.length,ln+3);i++) {
            console.log('  ['+(i+1)+'] '+sl[i].substring(0,100));
          }
        }
      }
    }
    pos = scriptEnd + 9;
  } else {
    pos = tagEnd + 1;
  }
}

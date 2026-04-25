const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8').replace(/\r\n/g,'\n').replace(/\r/g,'\n');

// Find script[20] by counting inline scripts (not src=)
const allParts = html.split('<script');
let inlineCount = 0;
let s20content = '';

for(let i=0;i<allParts.length;i++){
  const part = allParts[i];
  // Skip external scripts (src=)
  if(part.startsWith(' src') || part.startsWith('\nsrc') || part.startsWith('"') || part.startsWith("'")) continue;
  // This is an inline script - get content after >
  const gtIdx = part.indexOf('>');
  if(gtIdx < 0) continue;
  const content = part.substring(gtIdx+1).split('</script>')[0];
  if(inlineCount === 20){
    s20content = content;
    break;
  }
  inlineCount++;
}

console.log('Script[20] length:', s20content.length);
const lines = s20content.split('\n');
console.log('Script[20] lines:', lines.length);
for(let i=453;i<462;i++){
  if(i>=lines.length){console.log('L'+(i+1)+': OUT OF RANGE');continue;}
  const L=lines[i];
  console.log('L'+(i+1)+'('+L.length+')last='+L.charCodeAt(L.length-1)+':', JSON.stringify(L.substring(0,80)));
}

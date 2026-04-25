const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');
const parts = html.split('<script>');
let s = '', sIdx = -1;
for(let i=0;i<parts.length;i++){if(parts[i].includes('INC_STATES')){sIdx=i;s=parts[i].split('</script>')[0];break;}}
const lines = s.split('\n');

// Find exact error by checking each line
let errorLine = -1, errorMsg = '';
for(let i=1; i<=284; i++) {
  try { new Function(lines.slice(0,i).join('\n')); }
  catch(e) {
    if(!e.message.includes('end') && !e.message.includes('Unexpected end')) {
      errorLine = i; errorMsg = e.message;
      break;
    }
  }
}
console.log('Error at line:', errorLine, '|', errorMsg);
if(errorLine > 0) {
  for(let i=Math.max(0,errorLine-5); i<=Math.min(lines.length-1,errorLine+2); i++) {
    console.log('L'+(i+1)+'('+lines[i].length+'):', JSON.stringify(lines[i].substring(0,120)));
  }
}

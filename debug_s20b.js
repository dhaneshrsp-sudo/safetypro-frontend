const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8').replace(/\r\n/g,'\n').replace(/\r/g,'\n');

// Use exact split on <script> (no attributes = inline scripts)
const parts = html.split('<script>');
console.log('Total inline script parts:', parts.length-1);

// Script[20] = parts[21] (0-indexed: parts[0] is before first <script>)
// But our start array shows script[20] at HTML L9680 (0-indexed 9679)
// Let's find by HTML line number

// Count <script> tags (no src) and find which part is script[20]
const htmlLines = html.split('\n');

// Find all <script> tag line positions
const scriptLines = [];
for(let i=0;i<htmlLines.length;i++){
  if(htmlLines[i].trim() === '<script>') scriptLines.push(i);
}
console.log('Script tag lines (0-indexed):', scriptLines.slice(0,5).join(','), '...');
console.log('Script[20] starts at HTML line:', scriptLines[20]+1, '(1-indexed)');

// Get script[20] content
const s20start = scriptLines[20]+1;
const s20end = scriptLines[21] ? scriptLines[21] : htmlLines.length;
// Find </script> within range
let s20endActual = s20end;
for(let i=s20start;i<s20end;i++){
  if(htmlLines[i].trim()==='</script>'){s20endActual=i;break;}
}
const s20lines = htmlLines.slice(s20start, s20endActual);
console.log('Script[20] lines:', s20lines.length, 'from HTML L'+(s20start+1)+' to L'+(s20endActual+1));

// Binary search for error
let lo=1,hi=s20lines.length,f=-1,msg='';
while(lo<hi){
  const m=Math.floor((lo+hi)/2);
  try{eval(s20lines.slice(0,m).join('\n'));hi=m;}
  catch(e){if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){f=m;msg=e.message;hi=m;}else lo=m+1;}
}
console.log('ERR at L'+f+':', msg);
if(f>0){
  for(let i=Math.max(0,f-3);i<=f;i++){
    const htmlL = s20start+i;
    console.log('HTML L'+(htmlL+1)+'('+s20lines[i].length+')last='+s20lines[i].charCodeAt(s20lines[i].length-1)+':', JSON.stringify(s20lines[i].substring(0,100)));
  }
}

const fs = require('fs');
const c = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');
const lines = c.split('\n');

// Find all <script> tag positions (line numbers)
const scriptStarts = [];
lines.forEach(function(l, i){
  if(l.trim() === '<script>') scriptStarts.push(i+1);
});
console.log('Script start lines:', scriptStarts.join(', '));

// imsOpenScheduleModal is at HTML line 6370
// Find which script block contains line 6370
let containing = -1;
for(let i=0;i<scriptStarts.length;i++){
  const start = scriptStarts[i];
  const end = scriptStarts[i+1] || lines.length;
  if(start <= 6370 && 6370 <= end){
    containing = i;
    console.log('Contains line 6370: script #'+i+' (L'+start+'-'+end+')');
    break;
  }
}
if(containing >= 0){
  const s = scriptStarts[containing];
  const e = scriptStarts[containing+1] || lines.length;
  // Find </script> within this range
  let scriptEnd = e;
  for(let i=s;i<e;i++){
    if(lines[i].trim()==='</script>'){ scriptEnd=i; break; }
  }
  const scriptLines = lines.slice(s, scriptEnd);
  console.log('Script lines:', scriptLines.length);
  
  // Find error
  let lo=1,hi=scriptLines.length,f=-1,msg='';
  while(lo<hi){
    const m=Math.floor((lo+hi)/2);
    try{eval(scriptLines.slice(0,m).join('\n'));hi=m;}
    catch(e2){
      if(!e2.message.includes('end')&&!e2.message.includes('Unexpected end')){
        f=m;msg=e2.message;hi=m;
      } else lo=m+1;
    }
  }
  console.log(f===-1?'CLEAN':'ERR at L'+f+': '+msg);
  if(f>0){
    for(let i=Math.max(0,f-3);i<=Math.min(scriptLines.length-1,f+1);i++){
      console.log('L'+(i+1)+'('+scriptLines[i].length+'):', JSON.stringify(scriptLines[i].substring(0,120)));
    }
  }
}

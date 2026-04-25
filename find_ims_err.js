const fs = require('fs');
const c = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');

// Find the script block containing imsOpenScheduleModal
const idx = c.indexOf('imsOpenScheduleModal = function');
const htmlLine = c.substring(0,idx).split('\n').length;
console.log('imsOpenScheduleModal at HTML line:', htmlLine);

const before = c.substring(0, idx);
const scriptStart = before.lastIndexOf('<script>');
const scriptContent = c.substring(scriptStart).split('</script>')[0].replace('<script>','');
const lines = scriptContent.split('\n');
console.log('Script block total lines:', lines.length);

// Find error using eval binary search
let lo=1, hi=lines.length, f=-1, msg='';
while(lo<hi){
  const m=Math.floor((lo+hi)/2);
  try{eval(lines.slice(0,m).join('\n'));hi=m;}
  catch(e){
    if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){
      f=m; msg=e.message; hi=m;
    } else lo=m+1;
  }
}
console.log('ERR at L'+f+':', msg);
if(f>0){
  for(let i=Math.max(0,f-4);i<=Math.min(lines.length-1,f+1);i++){
    console.log('L'+(i+1)+'('+lines[i].length+'):', JSON.stringify(lines[i].substring(0,120)));
  }
}

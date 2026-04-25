const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');

// Find all script start/end positions
const scriptBlocks = [];
let inScript = false, scriptStart = -1;
for(let i=0;i<lines.length;i++){
  if(lines[i].trim()==='<script>'){ inScript=true; scriptStart=i+1; }
  else if(lines[i].trim()==='</script>' && inScript){
    scriptBlocks.push({start:scriptStart, end:i-1, len:i-scriptStart});
    inScript=false;
  }
}
console.log('Total script blocks:', scriptBlocks.length);

// Find which block contains imsOpenScheduleModal (around HTML L6370)
let targetBlock = null;
for(const b of scriptBlocks){
  if(b.start <= 6370 && b.end >= 6370){
    targetBlock = b;
    console.log('Found IMS script: L'+b.start+'-'+b.end+' ('+b.len+' lines)');
    break;
  }
}
if(!targetBlock){
  // Find the largest block closest to L6370
  const sorted = scriptBlocks.slice().sort(function(a,b){ return b.len-a.len; });
  console.log('Largest blocks:', sorted.slice(0,5).map(function(b){ return 'L'+b.start+'-L'+b.end+'('+b.len+')'; }).join(', '));
  // Find block that contains line 6370 approximately
  for(const b of scriptBlocks){
    if(b.start < 6370 && b.end > 6000){
      console.log('Possible block: L'+b.start+'-'+b.end);
    }
  }
  process.exit(0);
}

// Get script content
const scriptLines = lines.slice(targetBlock.start, targetBlock.end+1);
console.log('Script content lines:', scriptLines.length);

// Find error
let lo=1,hi=scriptLines.length,f=-1,msg='';
while(lo<hi){
  const m=Math.floor((lo+hi)/2);
  try{eval(scriptLines.slice(0,m).join('\n'));hi=m;}
  catch(e){
    if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){
      f=m;msg=e.message;hi=m;
    } else lo=m+1;
  }
}
console.log(f===-1?'CLEAN':'ERR at L'+f+': '+msg);
if(f>0){
  for(let i=Math.max(0,f-4);i<=Math.min(scriptLines.length-1,f+1);i++){
    const htmlLine = targetBlock.start + i;
    console.log('HTML L'+(htmlLine+1)+' S-L'+(i+1)+'('+scriptLines[i].length+'):', JSON.stringify(scriptLines[i].substring(0,120)));
  }
}

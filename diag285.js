const fs = require('fs');
const c = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');
const parts = c.split('<script>');
let s = '';
for(let i=0;i<parts.length;i++){if(parts[i].includes('INC_STATES')){s=parts[i].split('</script>')[0];break;}}
const lines = s.split('\n');

// Binary search within 1-284 for unclosed expression
// "Unexpected end of input" means we have unclosed brace - find which function isn't closed
let lo=1, hi=284, lastOk=-1;
while(lo<hi) {
  const mid=Math.floor((lo+hi)/2);
  try { new Function(lines.slice(0,mid).join('\n')+'\n})()'); lastOk=mid; hi=mid; }
  catch(e) {
    if(e.message.includes('end')||e.message.includes('Unexpected end')) lo=mid+1;
    else { hi=mid; }
  }
}
// Find last line that is OK (doesn't cause "unexpected end")
for(let i=280;i>=1;i--) {
  try { new Function(lines.slice(0,i).join('\n')); 
    console.log('Lines 1-'+i+': COMPLETE (no unclosed braces)'); break; }
  catch(e) { if(!e.message.includes('end')&&!e.message.includes('Unexpected end')){
    console.log('Lines 1-'+i+': REAL ERROR: '+e.message); break;
  }}
}

// Count braces in lines 1-284 to find imbalance
let open=0,close=0,inStr=false,strChar='',i=0;
const code=lines.slice(0,284).join('\n');
for(;i<code.length;i++){
  const ch=code[i];
  if(inStr){if(ch===strChar&&code[i-1]!=='\\')inStr=false;}
  else if(ch==='"'||ch==="'"){inStr=true;strChar=ch;}
  else if(ch==='{')open++;
  else if(ch==='}')close++;
}
console.log('Brace balance: open='+open+' close='+close+' diff='+(open-close));

// Show last 10 lines before 284
for(let j=274;j<284;j++) console.log('L'+(j+1)+'('+lines[j].length+'):', JSON.stringify(lines[j].substring(0,100)));

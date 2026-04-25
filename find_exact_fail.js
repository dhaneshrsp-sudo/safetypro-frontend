const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Script starts at 9680, body at 9681
// Test line by line to find exact failure
const start = 9680;
let end = 9680;
for (let i=start+1;i<10220;i++) { if(lines[i]&&lines[i].trim()==='</script>'){end=i;break;} }

const sl = lines.slice(start, end);
let failLine = -1, failErr = '';
for (let n=2; n<=sl.length; n++) {
  const t = sl.slice(0,n).join('\n');
  try { new Function(t); }
  catch(e) {
    if (!e.message.includes('end of input')) {
      const m = e.stack.match(/anonymous>:(\d+)/);
      failLine = n;
      failErr = e.message + ' at errLine='+(m?m[1]:'?');
      break;
    }
  }
}
console.log('First fail at script line:', failLine, '|', failErr);
if (failLine > 0) {
  for (let i=failLine-3;i<=failLine+1;i++) {
    if(sl[i]) console.log('SL'+(i+1)+'('+sl[i].length+'):', JSON.stringify(sl[i].substring(0,100)));
  }
}

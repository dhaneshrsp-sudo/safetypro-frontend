const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i+1;break;} }
for (let i = s27Start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;} }

const sl = lines.slice(s27Start, s27End);
console.log('Total script lines:', sl.length);

// Binary search for first non-EOF error
let lo = 1, hi = sl.length, foundAt = -1, foundErr = '';
while (lo < hi) {
  const mid = Math.floor((lo+hi)/2);
  try { new Function(sl.slice(0,mid).join('\n')); lo = mid+1; }
  catch(e) {
    if (e.message.includes('end of input') || e.message.includes('Expected')) { lo = mid+1; }
    else { foundAt = mid; foundErr = e.message; hi = mid; }
  }
}

if (foundAt > 0) {
  const m = foundErr;
  console.log('First syntax error introduced at line:', foundAt, '|', m);
  for(let i=Math.max(0,foundAt-3);i<=Math.min(sl.length-1,foundAt+1);i++) {
    console.log('  ['+(i+1)+']:', JSON.stringify(sl[i].substring(0,100)));
  }
} else {
  console.log('No syntax errors found ✅');
}

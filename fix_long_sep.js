const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Replace ALL /* ====...  lines (long separators) with just /* */
// Both closed and unclosed versions
let fixes = 0;
content = content.replace(/\/\* ={20,}[^*\n]* \*\//g, function() {
  fixes++;
  return '/* ' + '='.repeat(10) + ' */';
});
content = content.replace(/\/\* ={20,}$/gm, function() {
  fixes++;
  return '/* ' + '='.repeat(10) + ' */';
});
console.log('Total fixes:', fixes);

// Verify script #27
const lines = content.split('\n');
let start = -1, end = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){start=i+1;break;} }
for (let i = start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){end=i;break;} }
const sc = lines.slice(start, end).join('\n');
try { new Function(sc); console.log('S27 CLEAN ✅'); }
catch(e) {
  const m = e.stack.match(/anonymous>:(\d+)/);
  const ln = m ? parseInt(m[1]) : 0;
  const sl = sc.split('\n');
  console.log('S27 ERR L'+ln+':', e.message);
  for(let i=Math.max(0,ln-2);i<Math.min(sl.length,ln+2);i++) console.log(' ['+(i+1)+']:', sl[i].substring(0,80));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

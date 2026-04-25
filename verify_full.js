const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

let s27Start = -1, s27End = -1;
for (let i = 9678; i < 9685; i++) { if(lines[i]&&lines[i].trim()==='<script>'){s27Start=i+1;break;} }
for (let i = s27Start; i < 10220; i++) { if(lines[i]&&lines[i].trim()==='</script>'){s27End=i;break;} }

const sc = lines.slice(s27Start, s27End).join('\n');
console.log('Script length:', sc.length, 'lines:', sc.split('\n').length);

// Check last 5 lines
const scLines = sc.split('\n');
console.log('Last 5 lines:');
scLines.slice(-5).forEach(function(l,i) { console.log((scLines.length-4+i)+': '+JSON.stringify(l)); });

// Full parse test
try { 
  new Function(sc); 
  console.log('FULL SCRIPT: CLEAN ✅'); 
} catch(e) {
  if(e.message.includes('end of input')) {
    console.log('FULL SCRIPT: OK (unclosed IIFE - expected) ✅');
  } else {
    const m = e.stack.match(/anonymous>:(\d+)/);
    const ln = m ? parseInt(m[1]) : 0;
    console.log('FULL SCRIPT ERR at L'+ln+':', e.message);
    console.log('→', scLines[ln-1]?scLines[ln-1].substring(0,100):'(empty)');
  }
}

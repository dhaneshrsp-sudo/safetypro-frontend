const fs = require('fs');
const html = fs.readFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', 'utf8');
const lines = html.split('\n');
const L = lines[9752]; // HTML line 9753
console.log('L9753('+L.length+'):', L.substring(0, 120));
// Fix: src="+t.signature+'"style="ax-height -> src="'+t.signature+'" style="max-height
let fixed = L;
fixed = fixed.replace('src=""+t.signature+\'"style="ax-height', 'src="\''+'+t.signature+\'"style="max-height');
if (fixed !== L) { lines[9752] = fixed; console.log('Fixed L9753'); }
else { console.log('Pattern not matched - showing raw:'); console.log(JSON.stringify(L)); }
const out = lines.join('\n');
fs.writeFileSync('C:/safetypro_complete_frontend/safetypro_audit_compliance.html', Buffer.from(out,'utf8'));
console.log('Size:', out.length);
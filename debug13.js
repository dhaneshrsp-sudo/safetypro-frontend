const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Get exact script lines 1-12
const sl = lines.slice(9680, 9692);
sl.forEach(function(l,i){ console.log((i+1)+':', JSON.stringify(l)); });

// Try parsing incrementally
for (let n=2; n<=12; n++) {
  const test = sl.slice(0,n).join('\n');
  try { new Function(test); }
  catch(e) {
    if (!e.message.includes('end of input') && !e.message.includes('closing')) {
      console.log('FAIL at n='+n+': '+e.message);
    }
  }
}

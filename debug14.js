const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');
const start = 9680;
const sl = lines.slice(start);

// n=9 should pass (just unclosed)
// n=10 fails - check what exactly line 10 contains
console.log('SL10:', JSON.stringify(sl[9]));

// Test n=9 vs n=10
const t9 = sl.slice(0,9).join('\n');
const t10 = sl.slice(0,10).join('\n');

try { new Function(t9); console.log('n=9: OK'); }
catch(e) { console.log('n=9:', e.message); }

try { new Function(t10); console.log('n=10: OK'); }
catch(e) { 
  const m = e.stack.match(/anonymous>:(\d+):(\d+)/);
  console.log('n=10: ERR L'+(m?m[1]:'?')+' C'+(m?m[2]:'?')+': '+e.message);
}

// Check exact chars of SL7 (/* === */) for hidden chars
const sl7 = sl[6];
const codes = Array.from(sl7).map(c => c.charCodeAt(0));
const unusual = codes.map((c,i) => c!==47&&c!==42&&c!==32&&c!==61&&c!==46&&c!==10 ? i+':'+c : null).filter(Boolean);
console.log('SL7 unusual chars:', unusual.join(',') || 'none');
console.log('SL7 last 5 codes:', codes.slice(-5).join(','));

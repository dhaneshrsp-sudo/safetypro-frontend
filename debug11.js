const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script #27 body starts at line 9681 (index 9680)
// Show script lines 1-20 with FULL content
const start = 9680;
const sl = [];
for (let i = start; i < start+22; i++) sl.push(lines[i]);

sl.forEach(function(l, i) {
  console.log('SL'+(i+1)+'('+l.length+'): '+JSON.stringify(l.substring(0,100)));
});

// Test with increasing lines to find exact failure point
for (let n = 10; n <= 20; n++) {
  const test = sl.slice(0,n).join('\n');
  try { new Function(test); }
  catch(e) {
    if (!e.message.includes('Unexpected end')) {
      const m = e.stack.match(/anonymous>:(\d+)/);
      console.log('FAIL at n='+n+', errLine='+(m?m[1]:'?')+': '+e.message);
      break;
    }
  }
}

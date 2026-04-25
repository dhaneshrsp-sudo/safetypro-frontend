const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// The broken pattern after previous fix:
// :'var(--t3)')+'+(isPast?'\u2713':(i+1))+'</div>'+
// Should be:
// :'var(--t3)')+';">'+(isPast?'\u2713':(i+1))+'</div>'+
// (missing closing of style attribute ;"  and > of div tag)

const broken = ":'var(--t3)')+'+(isPast?'\\u2713':(i+1))+'</div>'+";
const fixed  = ":'var(--t3)')+';\">'+( isPast?'\\u2713':(i+1))+'</div>'+";

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  console.log('Fixed missing ;"> before content');
} else {
  console.log('Pattern not found - trying alternate...');
  // Try with actual unicode char
  const b2 = ":'var(--t3)')+'\\'+(isPast?";
  console.log('Has b2:', content.includes(b2));
  // Show what's around var(--t3) in the pipeline function
  const idx = content.lastIndexOf("var(--t3)");
  console.log('Context around var(--t3):', content.slice(idx-10, idx+60));
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);

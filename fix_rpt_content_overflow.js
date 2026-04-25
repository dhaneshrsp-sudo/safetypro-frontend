const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Find .content CSS rule and check overflow
let pos = 0, found = [];
while(true) {
  const idx = html.indexOf('.content{', pos);
  if(idx < 0) break;
  const end = html.indexOf('}', idx);
  found.push({idx, rule: html.substring(idx, end+1)});
  pos = idx + 1;
}
console.log('Found .content rules:');
found.forEach(function(f){ console.log(f.idx+':', f.rule.substring(0,200)); });

// 2. Fix: change overflow:hidden to overflow-y:auto on .content
// The sub-header tabs need to be visible, so content must not clip horizontally
let fixed = html;
found.forEach(function(f) {
  const original = f.rule;
  let updated = original;
  // Replace overflow:hidden with overflow-x:visible;overflow-y:auto  
  if(original.includes('overflow:hidden')) {
    updated = original.replace('overflow:hidden', 'overflow-x:visible;overflow-y:auto');
    fixed = fixed.replace(original, updated);
    console.log('Fixed overflow in:', original.substring(0,80));
  }
});

// 3. Also fix the ROW 1 parent div - needs min-width:0 and overflow:visible
const parentTag = '<div style="display:flex;align-items:center;gap:0;padding:0 16px;height:40px;flex-shrink:0;">';
const fixedParent = '<div style="display:flex;align-items:center;gap:0;padding:0 16px;height:40px;flex-shrink:0;min-width:0;overflow:visible;">';
if(fixed.includes(parentTag)) {
  fixed = fixed.replace(parentTag, fixedParent);
  console.log('Fixed ROW 1 parent div');
}

fs.writeFileSync(path, Buffer.from(fixed, 'utf8'));
console.log('Saved. Size:', fixed.length);

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_control.html';
let html = fs.readFileSync(path, 'utf8');

// Find the Objectives tab and all JS that references it
const objIdx = html.indexOf('Objectives');
let pos = 0, count = 0;
while(true) {
  const idx = html.indexOf('Objectives', pos);
  if(idx < 0) break;
  count++;
  const ctx = html.substring(idx-30, idx+80);
  console.log(count+':', JSON.stringify(ctx));
  pos = idx + 1;
}

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
const c = fs.readFileSync(path, 'utf8');

// Find sb-more-items div and check what comes after it
const idx = c.indexOf('<div id="sb-more-items"');
if(idx < 0) { console.log('sb-more-items NOT FOUND'); process.exit(1); }

// Count div depth to find correct closing tag
let depth=0, end=-1;
for(let i=idx; i<c.length; i++){
  if(c[i]==='<'){
    if(c.substring(i,i+4)==='<div') depth++;
    else if(c.substring(i,i+6)==='</div>'){
      depth--;
      if(depth===0){ end=i; break; }
    }
  }
}
console.log('sb-more-items: start='+idx+' end='+end+' len='+(end-idx));
console.log('--- CONTENT ---');
console.log(c.substring(idx, end+6));
console.log('--- AFTER (200 chars) ---');
console.log(c.substring(end+6, end+206));

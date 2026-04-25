const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');
const lines = c.split('\n');
let fixed = 0;

for(let i=9679; i<10050; i++) {
  if(!lines[i]) continue;
  let L = lines[i];
  const orig = L;
  // Fix pattern: (''+incNo+'') or similar broken onclick patterns
  L = L.replace(/\(''\+([a-zA-Z]+)\+''\)/g, "(''+$1+'')");
  // Actually the issue is ''+ which creates empty string - just remove the extra quotes
  L = L.replace(/window\.incSaveRCA\(''\+incNo\+''\)/g, "window.incSaveRCA('+incNo+')");
  L = L.replace(/window\.incAdvanceApproval\(''\+incNo\+''\)/g, "window.incAdvanceApproval('+incNo+')");
  L = L.replace(/window\.incShowApproval\(''\+incNo\+''\)/g, "window.incShowApproval('+incNo+')");
  if(L !== orig) { lines[i] = L; fixed++; console.log('Fixed L'+(i+1)); }
}

c = lines.join('\n');
fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Fixed:', fixed, 'Size:', c.length);
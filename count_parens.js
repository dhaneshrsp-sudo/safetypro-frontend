const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');
const sl = lines.slice(9680, 9690);

let opens=0, closes=0;
sl.forEach(function(l,i) {
  let lo=0, lc=0;
  // Skip chars inside strings and comments
  let inStr=false, strChar='', inCmt=false;
  for(let j=0;j<l.length;j++) {
    const c=l[j], n=l[j+1];
    if(inCmt) { if(c==='*'&&n==='/') inCmt=false; continue; }
    if(inStr) { if(c===strChar&&l[j-1]!=='\\') inStr=false; continue; }
    if(c==='/'&&n==='*') { inCmt=true; continue; }
    if(c==='/'&&n==='/') break; // line comment
    if(c==="'"||c==='"'||c==='`') { inStr=true; strChar=c; continue; }
    if(c==='(') { lo++; opens++; }
    if(c===')') { lc++; closes++; }
  }
  if(lo!==lc) console.log('L'+(i+1)+' MISMATCH: (+'+lo+' -'+lc+'): '+l.substring(0,80));
});
console.log('Total: opens='+opens+' closes='+closes);

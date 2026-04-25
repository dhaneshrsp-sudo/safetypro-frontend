const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');
const sl = lines.slice(9680, 9692);

// Count open vs close parens/brackets in each line
sl.slice(0,10).forEach(function(l,i) {
  let opens=0, closes=0;
  for(let j=0;j<l.length;j++) {
    if(l[j]==='(') opens++;
    if(l[j]===')') closes++;
  }
  if(opens !== closes) console.log('MISMATCH L'+(i+1)+'('+l.length+'): opens='+opens+' closes='+closes+' | '+l.substring(0,80));
});

// Also check for unclosed strings
sl.slice(0,10).forEach(function(l,i) {
  let singles=0, doubles=0;
  for(let j=0;j<l.length;j++) {
    if(l[j]==="'") singles++;
    if(l[j]==='"') doubles++;
  }
  if(singles%2!==0) console.log('UNCLOSED SINGLE QUOTE L'+(i+1)+':', l.substring(0,80));
  if(doubles%2!==0) console.log('UNCLOSED DOUBLE QUOTE L'+(i+1)+':', l.substring(0,80));
});

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Find top nav More - it uses class="nl" for nav links
// Look for the More nav link in the topnav
const nlMore = html.indexOf('>More</') > 0 ? html.indexOf('>More</') :
               html.indexOf('>More ') > 0 ? html.indexOf('>More ') : -1;

if(nlMore > 0) {
  console.log('Found top nav More text at:', nlMore);
  console.log('Context:', JSON.stringify(html.substring(nlMore-200, nlMore+400)));
} else {
  // Search for mm-wrap or nav more wrapper
  ['mm-wrap','nav-more','more-wrap','nl arr','More▼','More ▼'].forEach(p => {
    const i = html.indexOf(p);
    if(i > 0) console.log('"'+p+'" at', i, ':', JSON.stringify(html.substring(i-50,i+100)));
  });
  
  // Find all nl class links to understand nav structure
  console.log('\n--- All .nl links ---');
  let pos = 0;
  while(true) {
    const idx = html.indexOf('class="nl"', pos);
    if(idx < 0) break;
    const lineEnd = html.indexOf('\n', idx);
    console.log(html.substring(idx-5, lineEnd).substring(0,150));
    pos = idx + 1;
  }
}

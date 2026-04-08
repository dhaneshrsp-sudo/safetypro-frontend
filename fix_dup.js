const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Count legal tabs
const count = (h.match(/acMainTab\(this,'legal'\)/g)||[]).length;
console.log('Legal tab buttons found:', count);

// Remove duplicate tab button - keep only first
if(count > 1) {
  let found = 0;
  h = h.replace(/(<div class="sh-tab" onclick="acMainTab\(this,'legal'\)">&#9878; Legal &amp; Regulatory<\/div>\s*)/g, function(m) {
    found++;
    return found === 1 ? m : '';
  });
  console.log('Duplicate removed');
}

// Check ROR_DB
console.log('ROR_DB in file:', h.includes('var ROR_DB'));

fs.writeFileSync('safetypro_audit_compliance.html', h);
const countAfter = (h.match(/acMainTab\(this,'legal'\)/g)||[]).length;
console.log('Legal tab buttons after fix:', countAfter);

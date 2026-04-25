const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Line 4654 (index 4653): change '</div>' to '</div></body></html>';
if (lines[4653].trim() === "'</div>'") {
  lines[4653] = lines[4653].replace("'</div>'", "'</div></body></html>';");
  console.log('Fixed 4654:', lines[4653].trim());
} else {
  console.log('4654 unexpected:', lines[4653].trim());
}

// Remove lines 4655, 4656, 4657 (indices 4654, 4655, 4656)
// Filter out the Cloudflare beacon lines and the orphaned </body></html>';
const cf = 'static.cloudflareinsights.com/beacon.min.js';
const orphan = "</body></html>';";
const fixed = lines.filter((line, i) => {
  if (i >= 4654 && i <= 4656) {
    if (line.includes(cf) || line.trim() === orphan) {
      console.log('Removed line ' + (i+1) + ': ' + line.trim().substring(0,60));
      return false;
    }
  }
  return true;
});

console.log('Lines removed:', lines.length - fixed.length);
const buf = Buffer.from(fixed.join('\n'), 'utf8');
fs.writeFileSync(path, buf);

const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

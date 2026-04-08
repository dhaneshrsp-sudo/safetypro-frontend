const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Find what comes BEFORE the ror-legal-compliance marker
const rorPos = h.indexOf('/* ror-legal-compliance-v1 */');
const scriptOpen = h.lastIndexOf('<script>', rorPos);
const prev200 = h.substring(scriptOpen-10, scriptOpen+50);
console.log('Script block opening:', JSON.stringify(prev200));
console.log('Context before ROR marker:');
console.log(JSON.stringify(h.substring(rorPos-100, rorPos+50)));

// Find what the script BEFORE the ROR one contains
const prevScriptClose = h.lastIndexOf('</script>', scriptOpen);
console.log('Prev script closes at:', prevScriptClose);
console.log('Gap:', scriptOpen - prevScriptClose);

const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Fix duplicate tab — remove the extra one
const DUP = '<div class="sh-tab" onclick="acMainTab(this,\'legal\')">&#9878; Legal &amp; Regulatory</div>\n          <div class="sh-tab" onclick="acMainTab(this,\'legal\')">&#9878; Legal &amp; Regulatory</div>';
const SINGLE = '<div class="sh-tab" onclick="acMainTab(this,\'legal\')">&#9878; Legal &amp; Regulatory</div>';
if(h.includes(DUP)) { h = h.replace(DUP, SINGLE); console.log('Duplicate tab removed'); }

// Fix ROR_DB — check if JS is present
console.log('ROR_DB in file:', h.includes('var ROR_DB'));
console.log('rorRender in file:', h.includes('function rorRender'));

fs.writeFileSync('safetypro_audit_compliance.html', h);

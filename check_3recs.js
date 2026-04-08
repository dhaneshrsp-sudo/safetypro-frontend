const fs = require('fs');
const r = fs.readFileSync('safetypro_reports.html','utf8');
const a = fs.readFileSync('safetypro_audit_compliance.html','utf8');
console.log('Reports - Compliance Deadline Alerts:', r.includes('Compliance Deadline Alerts'));
console.log('Reports - lcRender SCENARIO A:', r.includes('SCENARIO A'));
console.log('Audit - ror-deadline-banner:', a.includes('ror-deadline-banner'));
console.log('Reports size:', Math.round(r.length/1024)+'KB');
console.log('Audit size:', Math.round(a.length/1024)+'KB');

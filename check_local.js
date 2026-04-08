const fs = require('fs');
const https = require('https');
const content = fs.readFileSync('safetypro_audit_compliance.html','utf8');
console.log('Local file size:', content.length);
console.log('Has ac-legal:', content.includes('ac-legal'));
console.log('Has ror-country:', content.includes('ror-country'));

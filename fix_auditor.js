const fs = require('fs');
let h = fs.readFileSync('safetypro_auditor.html','utf8');
h = h.replace('grid-template-columns:repeat(5,1fr);gap:8px;', 'grid-template-columns:repeat(6,1fr);gap:8px;');
fs.writeFileSync('safetypro_auditor.html', h, 'utf8');
console.log('PATCHED | 6 cols:', h.includes('repeat(6,1fr)'));

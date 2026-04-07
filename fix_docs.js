const fs = require('fs');
let h = fs.readFileSync('safetypro_documents.html','utf8');

// The stats container - found as <!-- STATS --> section
const OLD = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;align-items:start;">';
const NEW = '<div style="display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:8px!important;margin:0 0 8px 0!important;padding:0!important;align-items:start!important;">';

if(!h.includes(OLD)){console.log('NOT FOUND');process.exit();}
h = h.replace(OLD, NEW);
fs.writeFileSync('safetypro_documents.html', h, 'utf8');
console.log('PATCHED');

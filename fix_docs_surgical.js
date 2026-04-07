const fs = require('fs');
let h = fs.readFileSync('safetypro_documents.html','utf8');

// Kill the nth-child(2) rule and add final override
h = h.replace(/\.content > div:nth-child\(2\)\s*\{[^}]*\}/g, '');

// Add one-line override at end of body
const FIX = `<style>/* docs-pb-fix */.docs-scroll{padding-bottom:20px!important;padding-right:28px!important;}</style>`;
if(!h.includes('docs-pb-fix')) h = h.replace('</body>', FIX + '\n</body>');

fs.writeFileSync('safetypro_documents.html', h, 'utf8');
console.log('nth-child removed:', !h.includes('nth-child(2)'));
console.log('pb fix added:', h.includes('docs-pb-fix'));

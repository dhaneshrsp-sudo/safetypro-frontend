const fs = require('fs');
let h = fs.readFileSync('safetypro_documents.html','utf8');

// Check if nth-child rule exists
const before = (h.match(/\.content > div:nth-child\(2\)/g)||[]).length;
console.log('nth-child(2) occurrences before:', before);

// Remove ALL nth-child(2) rules
h = h.replace(/\.content\s*>\s*div:nth-child\(2\)\s*\{[^}]*\}/g, '');

const after = (h.match(/\.content > div:nth-child\(2\)/g)||[]).length;
console.log('nth-child(2) occurrences after:', after);

// Also ensure docs-pb-fix override exists at very end
h = h.replace(/<style>\/\* docs-pb-fix \*\/[^<]*<\/style>/g, '');
const OVERRIDE = '<style>/* docs-pb-fix */.docs-scroll{padding-bottom:20px!important;padding-right:28px!important;}</style>';
h = h.replace('</body>', OVERRIDE + '\n</body>');

fs.writeFileSync('safetypro_documents.html', h, 'utf8');
console.log('Done. Size:', Math.round(h.length/1024)+'KB');

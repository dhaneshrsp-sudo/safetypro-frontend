const fs = require('fs');

// Fix Documents - remove the offending nth-child rule and add padding-bottom override
let h = fs.readFileSync('safetypro_documents.html','utf8');

// Remove the nth-child(2) padding rule
h = h.replace(/\.content > div:nth-child\(2\)\{[^}]*padding[^}]*\}/g, '');
h = h.replace(/\.content > div:nth-child\(2\)\s*\{[^}]*\}/g, '');

// Add final override at end of body
const FIX_DOCS = `<style>
/* docs-footer-gap */
.docs-scroll{padding-bottom:24px!important;}
</style>`;
if(!h.includes('docs-footer-gap'))
  h = h.replace('</body>', FIX_DOCS + '\n</body>');

fs.writeFileSync('safetypro_documents.html', h, 'utf8');
console.log('docs fixed');

// Fix AI - same check
let h2 = fs.readFileSync('safetypro_ai.html','utf8');
const FIX_AI = `<style>
/* ai-card-gap */
.ai-scroll{padding-right:28px!important;}
</style>`;
if(!h2.includes('ai-card-gap'))
  h2 = h2.replace('</body>', FIX_AI + '\n</body>');

fs.writeFileSync('safetypro_ai.html', h2, 'utf8');
console.log('ai fixed');

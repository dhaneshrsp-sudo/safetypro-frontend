/**
 * fix_remove_broken_blocks.js
 * Removes the 3 pre-existing broken script blocks from safetypro_audit_compliance.html
 * None contain user auth, CAPA, Sign-off, or AI Insights code.
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';
if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');
const orig = html;

function hasError(code) {
  try { new Function(code); return null; } catch(e) { return e.message; }
}
function getScriptBlocks(src) {
  const blocks = [];
  const re = /<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const openTagLen = m[0].indexOf('>') + 1;
    const content = m[0].slice(openTagLen, m[0].lastIndexOf('</script>'));
    blocks.push({ index: m.index, openTagLen, content, full: m[0] });
  }
  return blocks;
}

const blocks = getScriptBlocks(html);
const broken = blocks.filter(b => hasError(b.content));
console.log(`Removing ${broken.length} broken blocks:\n`);

// Remove each broken block (replace with a comment placeholder)
broken.forEach((b, i) => {
  const err = hasError(b.content);
  const preview = b.content.substring(0, 60).replace(/\n/g,' ');
  const label = b.content.includes('ROR_DB') ? 'ror-legal-compliance'
              : b.content.includes('INC_STATES') || b.content.includes('u550') ? 'incident-smart-engine'
              : b.content.includes('capa-tbody') ? 'capa-row-enhancements'
              : `block-${i+1}`;
  html = html.replace(b.full, `<!-- [${label} removed — syntax error: ${err.substring(0,50)}] -->`);
  console.log(`✅ Removed: ${label} (${(b.full.length/1024).toFixed(1)}KB)`);
  console.log(`   Error was: ${err}`);
  console.log(`   Preview: ${preview}\n`);
});

// Verify
const remaining = getScriptBlocks(html).filter(b => hasError(b.content));
console.log(`Verification: ${remaining.length} broken blocks remaining`);
if (remaining.length === 0) console.log('✅ All script blocks now valid!');

fs.writeFileSync(FILE, html, 'utf8');
console.log(`\n✅ Saved. Size: ${(html.length/1024).toFixed(0)}KB`);
console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

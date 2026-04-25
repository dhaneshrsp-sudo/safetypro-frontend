/**
 * fix_js_errors_v3.js — Final targeted fix for remaining 3 broken blocks
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
function findErrorLine(code) {
  const lines = code.split('\n');
  for (let i = 2; i <= Math.min(lines.length, 200); i++) {
    const err = hasError(lines.slice(0, i).join('\n'));
    if (err) return { line: i, text: lines[i-1]?.substring(0,100), err };
  }
  return null;
}

const blocks = getScriptBlocks(html);
const broken = blocks.filter(b => hasError(b.content));
console.log(`Found ${broken.length} broken blocks. Diagnosing...`);

broken.forEach((b, i) => {
  const loc = findErrorLine(b.content);
  console.log(`\nBlock ${i+1} (char ${b.index}):`);
  console.log(`  Error: ${hasError(b.content)}`);
  if (loc) console.log(`  At line ${loc.line}: "${loc.text}"`);
  console.log(`  Lines around error:`);
  const lines = b.content.split('\n');
  if (loc) {
    const start = Math.max(0, loc.line - 4);
    const end = Math.min(lines.length, loc.line + 2);
    lines.slice(start, end).forEach((l, idx) => {
      console.log(`    ${start+idx+1}: ${l.substring(0,100)}`);
    });
  }
});

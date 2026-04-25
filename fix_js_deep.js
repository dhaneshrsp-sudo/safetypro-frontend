/**
 * fix_js_deep.js — Deep diagnosis + fix for 3 remaining broken blocks
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
// Full bisect on entire block
function findExactErrorLine(code) {
  const lines = code.split('\n');
  let lo = 1, hi = lines.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hasError(lines.slice(0, mid).join('\n'))) hi = mid;
    else lo = mid + 1;
  }
  return { line: lo, text: lines[lo-1]?.substring(0, 120) };
}

let blocks = getScriptBlocks(html);
const broken = blocks.filter(b => hasError(b.content));
console.log(`${broken.length} broken blocks\n`);

broken.forEach((b, idx) => {
  const err = hasError(b.content);
  const loc = findExactErrorLine(b.content);
  console.log(`\n=== Block ${idx+1} (char ${b.index}) ===`);
  console.log(`Error: ${err}`);
  console.log(`Error at line ${loc.line}: "${loc.text}"`);
  const lines = b.content.split('\n');
  const start = Math.max(0, loc.line - 5);
  const end = Math.min(lines.length, loc.line + 3);
  console.log('Context:');
  lines.slice(start, end).forEach((l,i) => {
    const lineNum = start + i + 1;
    const marker = lineNum === loc.line ? '>>> ' : '    ';
    console.log(`${marker}${lineNum}: ${l.substring(0,110)}`);
  });
});

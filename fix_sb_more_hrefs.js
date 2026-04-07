const fs = require('fs');
const path = require('path');
const DIR = process.cwd();

// Step 1: Extract the full correct sb-more-items block from operations
const ops = fs.readFileSync('safetypro_operations.html', 'utf8');
const itemsStart = ops.indexOf('<div id="sb-more-items"');

// Find the closing </div> of sb-more-items — it's the </div> after the last sb-item link + divider
// Walk forward finding all nested content until we hit the closing div of sb-more-items itself
let depth = 0;
let i = itemsStart;
let blockEnd = -1;
while (i < ops.length) {
  if (ops.substring(i, i+4) === '<div') depth++;
  if (ops.substring(i, i+6) === '</div>') {
    depth--;
    if (depth === 0) { blockEnd = i + 6; break; }
  }
  i++;
}

const CORRECT_ITEMS_BLOCK = ops.substring(itemsStart, blockEnd);
console.log('Extracted sb-more-items block from operations:');
console.log('  Length:', CORRECT_ITEMS_BLOCK.length);
console.log('  Links:', [...CORRECT_ITEMS_BLOCK.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).join(', '));

// Step 2: Fix these pages — replace their broken sb-more-items with the correct one
const PAGES = [
  'safetypro_documents.html',
  'safetypro_ai.html',
  'safetypro_auditor.html',
  'safetypro_field.html'
];

let patched = 0;

PAGES.forEach(filename => {
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }
  let html = fs.readFileSync(fp, 'utf8');

  const idx = html.indexOf('<div id="sb-more-items"');
  if (idx === -1) {
    console.log('SKIP — sb-more-items not found in:', filename);
    return;
  }

  // Find closing </div> of this sb-more-items block
  let d = 0, j = idx, end = -1;
  while (j < html.length) {
    if (html.substring(j, j+4) === '<div') d++;
    if (html.substring(j, j+6) === '</div>') {
      d--;
      if (d === 0) { end = j + 6; break; }
    }
    j++;
  }

  if (end === -1) {
    console.log('SKIP — could not find closing </div> in:', filename);
    return;
  }

  const oldBlock = html.substring(idx, end);
  console.log('\n' + filename);
  console.log('  Old hrefs:', [...oldBlock.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).join(', '));

  html = html.substring(0, idx) + CORRECT_ITEMS_BLOCK + html.substring(end);

  const newBlock = html.substring(html.indexOf('<div id="sb-more-items"'));
  console.log('  New hrefs:', [...newBlock.matchAll(/href="([^"]+)"/g)].slice(0,6).map(m=>m[1]).join(', '));

  fs.writeFileSync(fp, html, 'utf8');
  console.log('  PATCHED ✓  size:', Math.round(html.length/1024)+'KB');
  patched++;
});

console.log('\nTotal patched:', patched, '/ 4');
console.log('\nDeploy:');
console.log('  npx wrangler pages deploy . --project-name safetypro-frontend');

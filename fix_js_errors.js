/**
 * fix_js_errors.js
 * Fixes 3 pre-existing JS syntax errors in safetypro_audit_compliance.html
 * Run from HTML folder: node fix_js_errors.js
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';

if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');
const orig = html;
const log = [];

// ── Helper: extract all <script> blocks with positions ──────────────────────
function getScriptBlocks(src) {
  const blocks = [];
  const re = /<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const openEnd = m[0].indexOf('>') + 1;
    const closeStart = m[0].lastIndexOf('</script>');
    const content = m[0].slice(openEnd, closeStart);
    const startCharInFile = m.index + openEnd;
    blocks.push({ index: m.index, startCharInFile, content, fullMatch: m[0] });
  }
  return blocks;
}

// ── Helper: test syntax ──────────────────────────────────────────────────────
function hasError(code) {
  try { new Function(code); return null; }
  catch(e) { return e.message; }
}

// ── Helper: find error position by bisection ────────────────────────────────
function findErrorLine(code) {
  const lines = code.split('\n');
  for (let i = 1; i <= lines.length; i++) {
    const partial = lines.slice(0, i).join('\n');
    const err = hasError(partial);
    if (err) return { line: i, col: lines[i-1]?.length, content: lines[i-1]?.substring(0, 100), err };
  }
  return null;
}

const blocks = getScriptBlocks(html);
console.log(`Total script blocks: ${blocks.length}`);

let fixCount = 0;

blocks.forEach((block, idx) => {
  const err = hasError(block.content);
  if (!err) return;

  console.log(`\n📛 Block ${idx+1} has error: ${err}`);
  console.log(`   Starts at char ${block.startCharInFile} in file`);

  let fixed = block.content;

  // ── Fix 1: Missing ( before anonymous IIFE → function(){ → (function(){ ──
  if (err.includes('Function statements require a function name') || fixed.includes('\nfunction(){')) {
    const before = fixed;
    // Fix: \nfunction(){ → \n(function(){
    fixed = fixed.replace(/\nfunction\(\)\{/g, '\n(function(){');
    // Fix: \nuse strict'; → \n'use strict';
    fixed = fixed.replace(/\nuse strict';/g, "\n'use strict';");
    // Fix trailing stray comma after IIFE close: })();\n, → })();
    fixed = fixed.replace(/\}\)\(\);\s*\n,/g, '})();');
    // Fix: \n;\nn}) → \n;\n}) (stray 'n' before closing)
    fixed = fixed.replace(/;\n+n\}\)/g, ';\n})');
    if (fixed !== before) { log.push(`✅ Block ${idx+1}: IIFE syntax fixed`); fixCount++; }
  }

  // ── Fix 2: Invalid or unexpected token (scan for common patterns) ─────────
  if (err.includes('Invalid or unexpected token') || err.includes("Unexpected token")) {
    const before = fixed;
    // Fix unmatched backtick/string — scan for bare < in template strings
    // Fix: stray comma after closing IIFE
    fixed = fixed.replace(/\}\)\(\);\s*\n,\s*$/mg, '})();');
    // Fix stray semicolons before })
    fixed = fixed.replace(/;\n;\n\}\)/g, ';\n})');
    // Remove any HTML tags accidentally inside script blocks
    const htmlTagsInScript = fixed.match(/<(?!--)[a-zA-Z\/][^>]*>/);
    if (htmlTagsInScript) {
      console.log(`   ⚠️  HTML tags found in script block: ${htmlTagsInScript[0]}`);
    }
    if (fixed !== before) { log.push(`✅ Block ${idx+1}: token error fixed`); fixCount++; }
    else {
      // Try to find the exact line
      const errLine = findErrorLine(fixed);
      if (errLine) {
        console.log(`   Error at line ${errLine.line}: "${errLine.content}"`);
        log.push(`⚠️  Block ${idx+1}: error at line ${errLine.line} — needs manual review`);
      }
    }
  }

  // Replace block in html if fixed
  if (fixed !== block.content) {
    const newBlock = block.fullMatch.slice(0, block.fullMatch.indexOf('>') + 1) +
      fixed +
      '</script>';
    html = html.replace(block.fullMatch, newBlock);
    console.log(`   🔧 Fixed and replaced in file`);
  }
});

if (html !== orig) {
  fs.writeFileSync(FILE, html, 'utf8');
  console.log(`\n✅ ${fixCount} fix(es) applied. File saved.`);
} else {
  console.log('\nℹ️  No changes made — errors may need manual inspection.');
}

// ── Verify ──────────────────────────────────────────────────────────────────
const verifyBlocks = getScriptBlocks(html);
const stillBroken = verifyBlocks.filter(b => hasError(b.content));
console.log(`\nVerification: ${stillBroken.length} broken blocks remaining out of ${verifyBlocks.length}`);
if (stillBroken.length > 0) {
  stillBroken.forEach((b, i) => {
    const errLine = findErrorLine(b.content);
    console.log(`  Block error: ${hasError(b.content)} ${errLine ? 'at line '+errLine.line+': '+errLine.content.substring(0,60) : ''}`);
  });
}
console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

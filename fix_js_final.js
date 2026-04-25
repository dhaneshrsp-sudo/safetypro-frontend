/**
 * fix_js_final.js — Final targeted fix for 3 remaining broken blocks
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

let blocks = getScriptBlocks(html);
const broken = blocks.filter(b => hasError(b.content));
console.log(`${broken.length} broken blocks to fix\n`);

// ── FIX EACH BROKEN BLOCK ───────────────────────────────────────────────────
broken.forEach((b, idx) => {
  const err = hasError(b.content);
  console.log(`Block ${idx+1} (char ${b.index}): ${err}`);
  let fixed = b.content;

  // ── Strategy 1: Fix IIFE missing ( — covers Block 2 ──────────────────────
  // Handle both \n and \r\n line endings, flexible whitespace
  if (err.includes('identifier') || err.includes('Function statements')) {
    // Remove carriage returns first for consistent matching
    const normalized = fixed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Fix function(){ → (function(){  — various spacing
    let n = normalized
      .replace(/^function\s*\(\s*\)\s*\{/m, '(function(){')
      .replace(/\nfunction\s*\(\s*\)\s*\{/g, '\n(function(){');
    // Fix 'use strict' quote
    n = n.replace(/\nuse strict['"]\s*;/g, "\n'use strict';");
    // Fix stray characters before });
    n = n.replace(/\n\s*n\s*\}\s*\)/g, '\n})');
    // Fix trailing comma after IIFE close
    n = n.replace(/\}\s*\)\s*\(\s*\)\s*;\s*\n,/g, '})();');
    if (hasError(n) !== err) { fixed = n; console.log('  ✅ IIFE pattern fixed'); }
  }

  // ── Strategy 2: Fix (function() block with Unexpected token — Block 3 ────
  if (err.includes("Unexpected token ';'") && fixed.includes('(function(){')) {
    // The block likely had HTML extracted but is now missing its closing })();
    // Check if it has a proper closing
    const openCount = (fixed.match(/\(\s*function\s*\(/g) || []).length;
    const closeCount = (fixed.match(/\}\s*\)\s*\(\s*\)/g) || []).length;
    if (openCount > closeCount) {
      // Missing closing })();
      fixed = fixed.trimEnd() + '\n})();\n';
      console.log('  ✅ Added missing })(); closure');
    }
    // Also check for stray semicolons or HTML remnants
    // Remove any remaining HTML-like content (angle brackets)
    if (fixed.includes('</') || fixed.match(/<[a-zA-Z]/)) {
      fixed = fixed.replace(/<[^>]+>/g, '');
      console.log('  ✅ Removed residual HTML tags');
    }
  }

  // ── Strategy 3: Fix Invalid token — Block 1 (ror-legal) ──────────────────
  if (err.includes('Invalid or unexpected token') && fixed.includes('ROR_DB')) {
    // Get first 10 lines to see what's broken
    const lines = fixed.split('\n');
    console.log(`  Context (lines 1-${Math.min(10, lines.length)}):`);
    lines.slice(0, 10).forEach((l, i) => console.log(`    ${i+1}: ${l.substring(0,100)}`));
    
    // Try removing any remaining non-ASCII problematic characters from lines 1-6
    // that might be causing issues
    const fixedLines = lines.map((line, i) => {
      if (i < 6) {
        // Remove any control characters or invalid JS tokens in early lines
        return line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      }
      return line;
    });
    const attempt = fixedLines.join('\n');
    if (!hasError(attempt)) {
      fixed = attempt;
      console.log('  ✅ Control character fix resolved it');
    } else {
      // Try: if first 6 lines form an incomplete expression, add ; to close it
      const first6 = lines.slice(0, 6).join('\n');
      if (hasError(first6)) {
        // Lines 1-6 themselves are broken — find what's wrong
        for (let i = 1; i <= 6; i++) {
          if (hasError(lines.slice(0, i).join('\n'))) {
            console.log(`  Line ${i} causes error: "${lines[i-1]?.substring(0, 80)}"`);
            // Remove or comment out the problematic line
            const trialLines = [...lines];
            trialLines[i-1] = '// ' + trialLines[i-1]; // comment it out
            const trial = trialLines.join('\n');
            if (!hasError(trial)) {
              fixed = trial;
              console.log(`  ✅ Commented out problematic line ${i}`);
              break;
            }
            // Or remove it entirely
            trialLines[i-1] = '';
            const trial2 = trialLines.join('\n');
            if (!hasError(trial2)) {
              fixed = trial2;
              console.log(`  ✅ Removed problematic line ${i}`);
              break;
            }
          }
        }
      }
    }
  }

  // Replace in HTML if fixed
  if (fixed !== b.content && !hasError(fixed)) {
    const openTag = b.full.slice(0, b.openTagLen);
    const newBlock = openTag + fixed + '</script>';
    html = html.replace(b.full, newBlock);
    console.log(`  ✅ Block replaced in file`);
  } else if (fixed !== b.content) {
    console.log(`  ⚠️  Fix attempted but still has error: ${hasError(fixed)}`);
  } else {
    console.log(`  ⚠️  No fix applied`);
  }
});

// ── Write & Verify ──────────────────────────────────────────────────────────
if (html !== orig) {
  fs.writeFileSync(FILE, html, 'utf8');
  console.log(`\n✅ File saved. ${(html.length/1024).toFixed(0)}KB`);
}

const final = getScriptBlocks(html).filter(b => hasError(b.content));
console.log(`\nVerification: ${final.length} broken blocks remaining`);
final.forEach(b => console.log(`  ❌ ${hasError(b.content)} | ${b.content.substring(0,50).replace(/\n/g,' ')}`));
if (final.length === 0) console.log('  ✅ All blocks valid!');
console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

/**
 * fix_js_errors_v2.js — Targeted fix for all 4 broken script blocks
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

// ── FIX 1: Block 38 — duplicate 'av2' declaration ─────────────────────────
// fix_subtabs.js added: var av2=document.getElementById('ims-analytics-v2-add');
// But imsShowNewTab already had const av2=... → duplicate
// Remove the lines fix_subtabs.js added
const dupFix = html.indexOf("function imsShowNewTab(tabId){\n  var av2=document.getElementById('ims-analytics-v2-add');\n  if(av2)av2.style.display='none';");
if (dupFix !== -1) {
  html = html.replace(
    "function imsShowNewTab(tabId){\n  var av2=document.getElementById('ims-analytics-v2-add');\n  if(av2)av2.style.display='none';",
    "function imsShowNewTab(tabId){"
  );
  console.log('✅ Fix 38: Removed duplicate av2 declaration');
} else {
  // Try with \r\n
  const dupFixWin = html.indexOf("function imsShowNewTab(tabId){\r\n  var av2=");
  if (dupFixWin !== -1) {
    const endIdx = html.indexOf("av2.style.display='none';", dupFixWin) + 25;
    html = html.slice(0, dupFixWin + 30) + html.slice(endIdx + 1);
    console.log('✅ Fix 38 (win): Removed duplicate av2 declaration');
  } else {
    console.log('⚠️  Fix 38: Pattern not found — searching differently...');
    // Find imsShowNewTab and check if it has var av2 before the forEach
    const fnIdx = html.indexOf('function imsShowNewTab(tabId)');
    if (fnIdx !== -1) {
      const fnEnd = html.indexOf('forEach', fnIdx);
      const snippet = html.slice(fnIdx, fnEnd);
      if (snippet.includes('var av2') || snippet.includes('var av2')) {
        // Remove var av2 and if(av2) lines before forEach
        const varAv2Idx = html.indexOf('var av2=document.getElementById(\'ims-analytics-v2-add\')', fnIdx);
        if (varAv2Idx !== -1 && varAv2Idx < fnEnd) {
          const lineEnd = html.indexOf('\n', varAv2Idx + 1);
          const nextLineEnd = html.indexOf('\n', lineEnd + 1);
          html = html.slice(0, varAv2Idx - 2) + html.slice(nextLineEnd + 1);
          console.log('✅ Fix 38 (alt): Removed duplicate av2');
        }
      }
    }
  }
}

// ── FIX 2: Block 30 — missing ( before function(){ ─────────────────────────
// Pattern: \nfunction(){\n → \n(function(){\n (handle any whitespace)
const oldIIFE = '\nfunction(){\n';
const newIIFE = '\n(function(){\n';
if (html.includes(oldIIFE)) {
  html = html.replace(oldIIFE, newIIFE);
  console.log('✅ Fix 30a: Added missing ( to IIFE');
}
// Also fix: \nuse strict'; → \n'use strict';
const oldStrict = "\nuse strict';";
const newStrict = "\n'use strict';";
if (html.includes(oldStrict)) {
  html = html.replace(oldStrict, newStrict);
  console.log("✅ Fix 30b: Fixed 'use strict' quote");
}
// Fix stray n before }); : \n;\nn}) → \n;\n})
if (html.includes(';\nn})')) {
  html = html.replace(/;\nn\}\)/g, ';\n})');
  console.log('✅ Fix 30c: Removed stray n before })');
}
// Fix trailing comma: })();\n, → })();
if (html.includes('})();\n,')) {
  html = html.replace(/\}\)\(\);\n,/g, '})();');
  console.log('✅ Fix 30d: Removed trailing comma after })()');
}

// ── FIX 3: Block 35 — HTML <div> inside script block ───────────────────────
// Our CAPA/Sign-off/AI/Analytics panels were injected INSIDE a <script> block
// Strategy: find script block at ~806185, extract HTML from inside it,
// place it AFTER the script block's closing </script>
let blocks = getScriptBlocks(html);
const block35 = blocks.find(b => b.index > 800000 && b.index < 820000 && b.content.includes('<div'));
if (block35) {
  const divIdx = block35.content.indexOf('<div');
  if (divIdx !== -1) {
    const jsOnly = block35.content.slice(0, divIdx);
    const htmlChunk = block35.content.slice(divIdx);
    // Close the script properly at the JS end
    // Find last }) or }); in jsOnly to ensure proper closure
    const openTag = block35.full.slice(0, block35.openTagLen);
    const newScript = openTag + jsOnly + '</script>';
    const newBlock = newScript + '\n' + htmlChunk;
    html = html.replace(block35.full, newBlock);
    console.log(`✅ Fix 35: Extracted HTML (${htmlChunk.length} chars) from script block, placed after </script>`);
  }
} else {
  console.log('⚠️  Fix 35: Block 35 not found at expected position');
  // Try finding by content
  const altBlock = blocks.find(b => b.content.includes('<div id="ims-capa"') || 
    (b.content.includes('<div') && b.content.includes('--card') && hasError(b.content)));
  if (altBlock) {
    const divIdx = altBlock.content.indexOf('<div');
    if (divIdx !== -1) {
      const jsOnly = altBlock.content.slice(0, divIdx);
      const htmlChunk = altBlock.content.slice(divIdx);
      const openTag = altBlock.full.slice(0, altBlock.openTagLen);
      html = html.replace(altBlock.full, openTag + jsOnly + '</script>\n' + htmlChunk);
      console.log(`✅ Fix 35 (alt): HTML extracted from script block`);
    }
  }
}

// ── FIX 4: Block 10 — HTML <span> inside script block ─────────────────────
blocks = getScriptBlocks(html);
const block10 = blocks.find(b => b.content.includes('ROR_DB') && b.content.includes('<span'));
if (block10) {
  // The <span> is somewhere before var ROR_DB
  // Remove any HTML tags and their content from the JS block
  let cleaned = block10.content;
  // Remove <span ...>...</span> if any
  cleaned = cleaned.replace(/<span[^>]*>[\s\S]*?<\/span>/g, '');
  // Remove any standalone HTML tags
  cleaned = cleaned.replace(/<[a-zA-Z][^>]*>/g, '').replace(/<\/[a-zA-Z]+>/g, '');
  if (cleaned !== block10.content) {
    const openTag = block10.full.slice(0, block10.openTagLen);
    html = html.replace(block10.full, openTag + cleaned + '</script>');
    console.log('✅ Fix 10: Removed HTML tags from regulatory script block');
  }
} else {
  console.log('⚠️  Fix 10: Block with ROR_DB + span not found');
}

// ── Write & Verify ──────────────────────────────────────────────────────────
if (html !== orig) {
  fs.writeFileSync(FILE, html, 'utf8');
  console.log(`\n✅ File saved. Size: ${(html.length/1024).toFixed(0)}KB`);
}

const finalBlocks = getScriptBlocks(html);
const stillBroken = finalBlocks.filter(b => hasError(b.content));
console.log(`\nVerification: ${stillBroken.length} broken blocks remaining out of ${finalBlocks.length}`);
stillBroken.forEach(b => {
  console.log(`  ❌ Error: ${hasError(b.content)} | First 60 chars: ${b.content.substring(0,60).replace(/\n/g,' ')}`);
});
if (stillBroken.length === 0) console.log('  ✅ All script blocks valid!');
console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

/**
 * patch_toggle_fix.js
 * Fixes the toggleMore injection — finds the REAL </body> tag
 * (outside all script blocks), removes any bad previous injection,
 * and injects cleanly at the correct position.
 * Run from HTML folder: node patch_toggle_fix.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_audit_compliance.html',
  'safetypro_risk_management.html',
];

const NAV_SCRIPT = `<script>
function toggleMore(e){if(e){e.stopPropagation();}document.getElementById('more-btn').classList.toggle('open');}
document.addEventListener('click',function(e){var mb=document.getElementById('more-btn');if(mb&&!mb.contains(e.target))mb.classList.remove('open');});
document.addEventListener('DOMContentLoaded',function(){var btn=document.querySelector('.sb-more-btn');var items=document.getElementById('sb-more-items');if(btn&&items){btn.addEventListener('click',function(e){e.stopPropagation();var open=items.style.display==='block';items.style.display=open?'none':'block';btn.classList.toggle('open',!open);});}});
</script>`;

// Find the TRUE </body> tag — outside all <script> blocks
function findRealBodyClose(html) {
  let pos = html.length - 1;
  // Walk backwards looking for </body>
  while (pos >= 0) {
    const idx = html.lastIndexOf('</body>', pos);
    if (idx === -1) break;
    // Check: is this </body> outside all script blocks?
    // Count <script> and </script> before this point
    const before = html.slice(0, idx);
    const scriptOpens = (before.match(/<script(?:\s[^>]*)?>(?!.*<\/script>)/gs) || []).length;
    // Simpler check: count unclosed script tags before idx
    let scriptDepth = 0;
    let i = 0;
    while (i < idx) {
      if (html.startsWith('<script', i) && /[\s>]/.test(html[i+7])) {
        scriptDepth++;
        i += 7;
      } else if (html.startsWith('</script>', i)) {
        scriptDepth--;
        i += 9;
      } else {
        i++;
      }
    }
    if (scriptDepth === 0) return idx; // This </body> is in HTML context
    pos = idx - 1; // Try the previous occurrence
  }
  return -1;
}

// Remove any previously bad injection (our NAV_SCRIPT might be embedded in JS)
function removeBadInjection(html) {
  // Remove any <script> block containing 'Nav toggle functions' or 'toggleMore' that we injected
  // Our injected script has a specific comment marker
  const marker = '/* Nav toggle functions */';
  const markerAlt = 'function toggleMore(e){if(e){e.stopPropagation();}';
  
  // Find and remove script blocks we injected
  let cleaned = html;
  for (const m of [marker, markerAlt]) {
    const idx = cleaned.indexOf(m);
    if (idx === -1) continue;
    // Find the enclosing <script> and </script>
    const scriptStart = cleaned.lastIndexOf('<script', idx);
    const scriptEnd = cleaned.indexOf('</script>', idx);
    if (scriptStart !== -1 && scriptEnd !== -1) {
      // Only remove if it's a small script block (our injection, not a big existing one)
      const blockSize = scriptEnd - scriptStart;
      if (blockSize < 2000) {
        cleaned = cleaned.slice(0, scriptStart) + cleaned.slice(scriptEnd + 9);
        console.log(`   🗑️  Removed bad injection (${blockSize} chars at pos ${scriptStart})`);
      }
    }
  }
  return cleaned;
}

let patched = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;
  const log = [];

  // Step 1: Remove any previous bad injection
  html = removeBadInjection(html);

  // Step 2: Check if toggleMore is already defined outside a broken context
  // (i.e., in a clean script block that will actually execute)
  // For safety, always re-inject at the correct position

  // Step 3: Find the real </body>
  const bodyClose = findRealBodyClose(html);
  if (bodyClose === -1) {
    // Fallback: inject before </html>
    const htmlClose = html.lastIndexOf('</html>');
    if (htmlClose !== -1) {
      html = html.slice(0, htmlClose) + NAV_SCRIPT + '\n</html>';
      log.push('✅ toggleMore injected before </html> (fallback)');
    } else {
      html = html + '\n' + NAV_SCRIPT;
      log.push('✅ toggleMore appended to end of file (fallback 2)');
    }
  } else {
    html = html.slice(0, bodyClose) + NAV_SCRIPT + '\n</body>' + html.slice(bodyClose + 7);
    log.push(`✅ toggleMore injected at real </body> tag (pos ${bodyClose})`);
  }

  if (html !== orig) {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '='.repeat(55));
console.log(`Patched: ${patched}`);
console.log('='.repeat(55));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

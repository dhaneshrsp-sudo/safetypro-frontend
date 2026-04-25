/**
 * patch_risk_sidebar_fix.js
 * Fixes only safetypro_risk_management.html sidebar (attribute-order-safe approach).
 * Run from your HTML folder: node patch_risk_sidebar_fix.js
 */

const fs = require('fs');

const FILE = 'safetypro_risk_management.html';
const SB_NEW_ITEM = `<a class="sb-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;

if (!fs.existsSync(FILE)) {
  console.log(`❌ ${FILE} not found. Run from your HTML folder.`);
  process.exit(1);
}

let html = fs.readFileSync(FILE, 'utf8');

// Guard: already patched?
if (/class="sb-item[^"]*"[^>]*href="safetypro_risk_management/.test(html) ||
    /href="safetypro_risk_management[^"]*"[^>]*class="sb-item/.test(html)) {
  console.log('ℹ️  Sidebar already patched. Nothing to do.');
  process.exit(0);
}

// Strategy: find ANY sb-item link to esg or admin (attribute-order-independent)
// We search for the raw href string and walk back to the opening <a tag
const ANCHORS = ['safetypro_esg', 'safetypro_admin'];
let done = false;

for (const anchor of ANCHORS) {
  const idx = html.indexOf(`href="${anchor}`);
  if (idx === -1) continue;

  // Walk back to find the opening <a
  const aStart = html.lastIndexOf('<a', idx);
  if (aStart === -1) continue;

  // Confirm it's an sb-item
  const tagSnippet = html.substring(aStart, aStart + 120);
  if (!tagSnippet.includes('sb-item')) continue;

  // Insert the new item just before this <a
  html = html.slice(0, aStart) + SB_NEW_ITEM + '\n          ' + html.slice(aStart);
  console.log(`✅ Sidebar: Risk Management inserted before "${anchor}" anchor`);
  done = true;
  break;
}

if (!done) {
  // Last resort: insert before closing </div> of .sidebar
  const sidebarClose = html.indexOf('</div>', html.indexOf('class="sidebar"'));
  if (sidebarClose !== -1) {
    html = html.slice(0, sidebarClose) + '          ' + SB_NEW_ITEM + '\n        ' + html.slice(sidebarClose);
    console.log('✅ Sidebar: Risk Management appended (end-of-sidebar fallback)');
    done = true;
  }
}

if (!done) {
  console.log('❌ Could not find sidebar insertion point. Manual fix needed.');
  process.exit(1);
}

fs.writeFileSync(FILE, html, 'utf8');
console.log(`\n✅ ${FILE} saved.`);
console.log('\nNow deploy:');
console.log('  npx wrangler pages deploy . --project-name=safetypro-frontend');

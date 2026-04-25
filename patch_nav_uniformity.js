/**
 * patch_nav_uniformity.js
 * Fixes: correct order, no emoji, adds SVG icon to Risk Management,
 * adds ESG to More dropdown, syncs sequence between both navs.
 * Run from your HTML folder: node patch_nav_uniformity.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// ── Canonical More dropdown content (correct order, no emojis, ESG included) ─
const CANONICAL_MORE_MENU = `
        <a class="mm-item" href="safetypro_audit_compliance">Audit &amp; Compliance</a>
        <a class="mm-item" href="safetypro_risk_management">Risk Management</a>
        <a class="mm-item" href="safetypro_field">Site &amp; Field Tools</a>
        <a class="mm-item" href="safetypro_hrm.html">HRM &amp; Payroll</a>
        <a class="mm-item" href="safetypro_ai">AI Intelligence</a>
        <a class="mm-item" href="safetypro_auditor">Client &amp; Auditor Portal</a>
        <a class="mm-item" href="safetypro_documents">Documents &amp; Records</a>
        <a class="mm-item" href="safetypro_esg.html">Sustainability &amp; ESG</a>
        <a class="mm-item mm-admin" href="safetypro_admin.html">Admin &amp; Configuration</a>
      `;

// ── Shield SVG for Risk Management sidebar icon ───────────────────────────────
const RISK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }

  let html = fs.readFileSync(filename, 'utf8');
  let orig = html;
  const log = [];

  // ── FIX 1: Replace entire more-menu content ──────────────────────────────
  // Match <div class="more-menu"...>...</div> and replace its inner content
  const mmStart = html.indexOf('class="more-menu"');
  if (mmStart !== -1) {
    const divOpen = html.lastIndexOf('<div', mmStart);
    // Find matching closing </div>
    let depth = 0, i = divOpen;
    while (i < html.length) {
      if (html.startsWith('<div', i) && (html[i+4]===' '||html[i+4]==='>'||html[i+4]==='\n')) { depth++; i+=4; }
      else if (html.startsWith('</div>', i)) { depth--; if (depth===0) { break; } i+=6; }
      else i++;
    }
    const divClose = i; // points to start of </div>
    // Find the > that ends the opening tag
    const openTagEnd = html.indexOf('>', divOpen) + 1;
    // Replace content between opening tag and closing </div>
    html = html.slice(0, openTagEnd) + CANONICAL_MORE_MENU + html.slice(divClose);
    log.push('✅ More dropdown: canonical order applied (Risk Management 2nd, ESG added)');
  } else {
    log.push('⚠️  more-menu not found');
  }

  // ── FIX 2: Fix Risk Management sb-item — remove emoji, add SVG icon ───────
  // Find all occurrences of the Risk Management sb-item (href-based, order-independent)
  const rmHrefPattern = 'href="safetypro_risk_management"';
  const rmHrefAlt = "href='safetypro_risk_management'";
  let searchPos = 0;
  let rmFixed = false;

  while (true) {
    let hrefIdx = html.indexOf(rmHrefPattern, searchPos);
    if (hrefIdx === -1) hrefIdx = html.indexOf(rmHrefAlt, searchPos);
    if (hrefIdx === -1) break;

    // Walk back to <a
    const aStart = html.lastIndexOf('<a', hrefIdx);
    if (aStart === -1) { searchPos = hrefIdx + 1; continue; }

    // Find closing </a>
    const aEnd = html.indexOf('</a>', hrefIdx);
    if (aEnd === -1) { searchPos = hrefIdx + 1; continue; }

    const fullTag = html.slice(aStart, aEnd + 4);
    const isSbItem = fullTag.includes('sb-item');
    const isMmItem = fullTag.includes('mm-item');

    if (isSbItem) {
      // Check if it already has SVG and no emoji
      const hasIcon = fullTag.includes('<svg');
      const hasEmoji = fullTag.includes('⚠️') || fullTag.includes('&#9888;');

      if (!hasIcon || hasEmoji) {
        // Build clean replacement: class preserved, SVG added, text clean
        // Extract current class
        const clsMatch = fullTag.match(/class="([^"]+)"/);
        const cls = clsMatch ? clsMatch[1] : 'sb-item';
        const newTag = `<a class="${cls}" href="safetypro_risk_management">${RISK_SVG}Risk Management</a>`;
        html = html.slice(0, aStart) + newTag + html.slice(aEnd + 4);
        log.push('✅ Sidebar sb-item: SVG icon added, emoji removed');
        rmFixed = true;
      } else {
        log.push('ℹ️  Sidebar sb-item: already has icon');
      }
    } else if (isMmItem) {
      // Just remove emoji from mm-item
      const hasEmoji = fullTag.includes('⚠️') || fullTag.includes('&#9888;');
      if (hasEmoji) {
        const fixed = fullTag.replace(/⚠️\s*/g, '').replace(/&#9888;[\uFE0F]?\s*/g, '');
        html = html.slice(0, aStart) + fixed + html.slice(aEnd + 4);
        log.push('✅ More mm-item: emoji removed');
      }
    }

    searchPos = aStart + 1;
  }

  if (!rmFixed && !log.some(l => l.includes('sb-item'))) {
    log.push('⚠️  Risk Management sb-item not found');
  }

  // ── FIX 3: Remove stray ⚠️ from any remaining Risk Management links ────────
  html = html.replace(/⚠️\s*Risk Management/g, 'Risk Management');

  // ── Write if changed ───────────────────────────────────────────────────────
  if (html !== orig) {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  } else {
    skipped++;
    log.push('(no changes needed)');
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '-'.repeat(60));
console.log(`Patched: ${patched}  |  Skipped: ${skipped}`);
console.log('-'.repeat(60));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

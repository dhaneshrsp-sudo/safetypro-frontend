/**
 * patch_risk_management_nav_v2.js
 * Adds "Risk Management" to More dropdown and Sidebar across all SafetyPro HTML pages.
 * FIXED: precise guard (regex on mm-item/sb-item only), fallback anchors for risk_management.html
 *
 * Run from the folder containing your HTML files:
 *   node patch_risk_management_nav_v2.js
 */

const fs = require('fs');

const FILES = [
  'safetypro_v2.html',
  'safetypro_operations.html',
  'safetypro_control.html',
  'safetypro_reports.html',
  'safetypro_admin.html',
  'safetypro_audit_compliance.html',
  'safetypro_field.html',
  'safetypro_hrm.html',
  'safetypro_ai.html',
  'safetypro_documents.html',
  'safetypro_auditor.html',
  'safetypro_risk_management.html',
];

// What to insert
const MM_NEW_ITEM = `<a class="mm-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;
const SB_NEW_ITEM = `<a class="sb-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;

// ── PRECISE guards — only match if already inside mm-item or sb-item ─────────
// True only if a real mm-item/sb-item for Risk Management already exists in the nav
const MM_ALREADY = /class="mm-item[^"]*"[^>]*href="safetypro_risk_management/;
const SB_ALREADY = /class="sb-item[^"]*"[^>]*href="safetypro_risk_management/;

let patchedCount = 0;
let skippedCount = 0;
let missingCount = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) {
    console.log(`⚠️  MISSING: ${filename}`);
    missingCount++;
    continue;
  }

  let html = fs.readFileSync(filename, 'utf8');
  let changed = false;
  const log = [];

  // ════════════════════════════════════════════════════════════════════
  // 1. MORE DROPDOWN
  // ════════════════════════════════════════════════════════════════════
  if (MM_ALREADY.test(html)) {
    log.push('ℹ️  More dropdown: already patched');
  } else {
    let mmDone = false;

    // Strategy A: mm-admin class (most pages)
    if (!mmDone && html.includes('mm-item mm-admin')) {
      const idx = html.indexOf('mm-item mm-admin');
      const aStart = html.lastIndexOf('<a', idx);
      html = html.slice(0, aStart) + MM_NEW_ITEM + '\n        ' + html.slice(aStart);
      log.push('✅ More dropdown: added (mm-admin anchor)');
      mmDone = true;
      changed = true;
    }

    // Strategy B: last mm-item before safetypro_admin href (risk_management.html)
    if (!mmDone) {
      // Find the mm-item that links to admin (with or without .html)
      const adminRe = /<a\s+class="mm-item[^"]*"\s+href="safetypro_admin(?:\.html)?"/;
      const match = adminRe.exec(html);
      if (match) {
        const aStart = match.index;
        html = html.slice(0, aStart) + MM_NEW_ITEM + '\n        ' + html.slice(aStart);
        log.push('✅ More dropdown: added (admin href fallback)');
        mmDone = true;
        changed = true;
      }
    }

    // Strategy C: end of .more-menu div (last resort)
    if (!mmDone && html.includes('more-menu')) {
      // Find closing tag of more-menu
      const closeRe = /<\/div>(\s*<\/div>\s*<\/div>)/; // closing more-menu, more-wrap
      const mmEndIdx = html.lastIndexOf('</div>', html.indexOf('more-wrap') + 2000);
      if (mmEndIdx !== -1) {
        html = html.slice(0, mmEndIdx) + '\n        ' + MM_NEW_ITEM + '\n      ' + html.slice(mmEndIdx);
        log.push('✅ More dropdown: added (end-of-menu fallback)');
        mmDone = true;
        changed = true;
      }
    }

    if (!mmDone) {
      log.push('❌ More dropdown: no anchor found — MANUAL FIX NEEDED');
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. SIDEBAR
  // ════════════════════════════════════════════════════════════════════
  if (SB_ALREADY.test(html)) {
    log.push('ℹ️  Sidebar: already patched');
  } else {
    let sbDone = false;

    // Strategy A: insert after audit_compliance sb-item (most pages)
    if (!sbDone) {
      const sbAuditRe = /(<a\s+class="sb-item[^"]*"\s+href="safetypro_audit_compliance(?:\.html)?">[\s\S]*?<\/a>)/;
      const match = sbAuditRe.exec(html);
      if (match) {
        const insertAt = match.index + match[0].length;
        html = html.slice(0, insertAt) + '\n          ' + SB_NEW_ITEM + html.slice(insertAt);
        log.push('✅ Sidebar: added after Audit & Compliance');
        sbDone = true;
        changed = true;
      }
    }

    // Strategy B: insert before ESG link (risk_management page — no audit_compliance in sidebar)
    if (!sbDone) {
      const esgRe = /<a\s+class="sb-item[^"]*"\s+href="safetypro_esg(?:\.html)?"/;
      const match = esgRe.exec(html);
      if (match) {
        html = html.slice(0, match.index) + SB_NEW_ITEM + '\n          ' + html.slice(match.index);
        log.push('✅ Sidebar: added before ESG (fallback)');
        sbDone = true;
        changed = true;
      }
    }

    // Strategy C: insert before Admin sb-item
    if (!sbDone) {
      const adminSbRe = /<a\s+class="sb-item[^"]*"\s+href="safetypro_admin(?:\.html)?"/;
      const match = adminSbRe.exec(html);
      if (match) {
        html = html.slice(0, match.index) + SB_NEW_ITEM + '\n          ' + html.slice(match.index);
        log.push('✅ Sidebar: added before Admin (fallback)');
        sbDone = true;
        changed = true;
      }
    }

    if (!sbDone) {
      log.push('❌ Sidebar: no anchor found — MANUAL FIX NEEDED');
    }
  }

  // ── Write back ─────────────────────────────────────────────────────
  if (changed) {
    fs.writeFileSync(filename, html, 'utf8');
    patchedCount++;
  } else {
    skippedCount++;
  }

  console.log(`\n📄 ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

// ── Summary ─────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(55));
console.log(`✅ Patched : ${patchedCount} file(s)`);
console.log(`ℹ️  Skipped : ${skippedCount} file(s) (already patched or no nav)`);
console.log(`⚠️  Missing : ${missingCount} file(s) not found on disk`);
console.log('─'.repeat(55));
console.log('\nDone! Now deploy:');
console.log('  npx wrangler pages deploy . --project-name=safetypro-frontend');

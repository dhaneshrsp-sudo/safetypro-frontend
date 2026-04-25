/**
 * patch_sidebar_riskmanagement_v3.js
 * Targets ONLY the #sb-more-items div, attribute-order-independent.
 * Inserts Risk Management after Audit & Compliance in the sidebar more section.
 *
 * Run from your HTML folder:  node patch_sidebar_riskmanagement_v3.js
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

const NEW_ITEM = `<a class="sb-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;

// Precise guard: only true if a real sb-item pointing to risk_management already exists
function alreadyHasRisk(html) {
  return html.includes('href="safetypro_risk_management"') ||
         html.includes("href='safetypro_risk_management'");
}

let patched = 0, skipped = 0, failed = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) {
    console.log(`⚠️  MISSING: ${filename}`);
    failed++;
    continue;
  }

  let html = fs.readFileSync(filename, 'utf8');
  const log = [];

  if (alreadyHasRisk(html)) {
    log.push('ℹ️  Sidebar: already has Risk Management');
    skipped++;
    console.log(`\n📄 ${filename}`);
    log.forEach(l => console.log(`   ${l}`));
    continue;
  }

  // ── Find #sb-more-items block ─────────────────────────────────────────────
  const sbMoreStart = html.indexOf('id="sb-more-items"');
  if (sbMoreStart === -1) {
    log.push('⚠️  #sb-more-items not found — trying plain sidebar');
    // Fallback: find sidebar class and insert after audit_compliance link
  }

  // ── Strategy: find audit_compliance href anywhere in sidebar context ───────
  // Works regardless of attribute order (href-first or class-first)
  const AUDIT_HREF = 'audit_compliance';
  let done = false;

  // Search within #sb-more-items block first (preferred)
  const searchStart = sbMoreStart !== -1 ? sbMoreStart : 0;
  const auditIdx = html.indexOf(AUDIT_HREF, searchStart);

  if (auditIdx !== -1) {
    // Walk back to the opening <a of this link
    const aStart = html.lastIndexOf('<a', auditIdx);
    if (aStart !== -1) {
      // Find closing </a> after auditIdx
      const closeIdx = html.indexOf('</a>', auditIdx);
      if (closeIdx !== -1) {
        const insertAt = closeIdx + '</a>'.length;
        html = html.slice(0, insertAt) + '\n      ' + NEW_ITEM + html.slice(insertAt);
        log.push('✅ Sidebar: Risk Management inserted after Audit & Compliance');
        done = true;
      }
    }
  }

  // Fallback: insert before ESG in sb-more-items
  if (!done) {
    const esgIdx = html.indexOf('safetypro_esg', searchStart);
    if (esgIdx !== -1) {
      const aStart = html.lastIndexOf('<a', esgIdx);
      if (aStart !== -1) {
        html = html.slice(0, aStart) + NEW_ITEM + '\n      ' + html.slice(aStart);
        log.push('✅ Sidebar: Risk Management inserted before ESG (fallback)');
        done = true;
      }
    }
  }

  // Fallback 2: insert before Admin in sb-more-items
  if (!done) {
    const adminIdx = html.indexOf('safetypro_admin', searchStart);
    if (adminIdx !== -1) {
      const aStart = html.lastIndexOf('<a', adminIdx);
      if (aStart !== -1) {
        html = html.slice(0, aStart) + NEW_ITEM + '\n      ' + html.slice(aStart);
        log.push('✅ Sidebar: Risk Management inserted before Admin (fallback 2)');
        done = true;
      }
    }
  }

  if (!done) {
    log.push('❌ Could not find insertion point — MANUAL FIX NEEDED');
    failed++;
  } else {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  }

  console.log(`\n📄 ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '─'.repeat(55));
console.log(`✅ Patched : ${patched} file(s)`);
console.log(`ℹ️  Skipped : ${skipped} file(s)`);
console.log(`❌ Failed  : ${failed} file(s)`);
console.log('─'.repeat(55));
console.log('\nDeploy with:');
console.log('  npx wrangler pages deploy . --project-name=safetypro-frontend');

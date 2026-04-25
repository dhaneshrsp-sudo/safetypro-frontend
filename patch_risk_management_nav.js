/**
 * patch_risk_management_nav.js
 * Adds "Risk Management" to More dropdown and Sidebar across all SafetyPro HTML pages.
 * Run from the folder containing your HTML files:
 *   node patch_risk_management_nav.js
 */

const fs = require('fs');
const path = require('path');

// ── Target files ────────────────────────────────────────────────────────────
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

// ── What to insert ───────────────────────────────────────────────────────────
// More dropdown: insert before the mm-admin (Admin) item
const MM_NEW_ITEM = `<a class="mm-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;

// Sidebar: insert after the Audit & Compliance sb-item
const SB_NEW_ITEM = `<a class="sb-item" href="safetypro_risk_management">⚠️ Risk Management</a>`;

// ── Anchors ──────────────────────────────────────────────────────────────────
// For More dropdown: find the Admin entry (mm-admin) and insert before it
// Regex: matches the Admin mm-item line (with optional whitespace/newlines before it)
const MM_ADMIN_REGEX = /(<a\s+class="mm-item\s+mm-admin")/;

// For Sidebar: find the Audit & Compliance sb-item closing tag and insert after it
// Matches: <a class="sb-item" href="safetypro_audit_compliance[.html]">...</a>
const SB_AUDIT_REGEX = /(<a\s+class="sb-item"\s+href="safetypro_audit_compliance(?:\.html)?">.*?<\/a>)/s;

// ── Guard strings (skip if already patched) ──────────────────────────────────
const MM_GUARD = 'safetypro_risk_management';
const SB_GUARD = 'safetypro_risk_management';

// ── Process each file ────────────────────────────────────────────────────────
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
  let log = [];

  // ── 1. More dropdown patch ─────────────────────────────────────────────────
  // Check if more-menu section exists and doesn't already have Risk Management
  const hasMoreMenu = html.includes('class="more-menu"') || html.includes("class='more-menu'") || html.includes('more-wrap');
  const mmAlreadyPatched = html.includes(MM_GUARD) && html.includes('mm-item');

  if (hasMoreMenu && !mmAlreadyPatched) {
    if (MM_ADMIN_REGEX.test(html)) {
      html = html.replace(MM_ADMIN_REGEX, `${MM_NEW_ITEM}\n        $1`);
      log.push('✅ More dropdown: Risk Management added');
      changed = true;
    } else {
      // Fallback: insert before mm-admin using string match
      const adminStr = 'class="mm-item mm-admin"';
      if (html.includes(adminStr)) {
        html = html.replace(adminStr, `${MM_NEW_ITEM}\n        <a ${adminStr.replace('class="', '')}`);
        // Actually let's do a cleaner replace:
        // Reset and redo with direct string replacement
        html = fs.readFileSync(filename, 'utf8');
        const idx = html.indexOf(adminStr);
        if (idx !== -1) {
          // Find the start of that <a tag
          const aStart = html.lastIndexOf('<a', idx);
          html = html.slice(0, aStart) + MM_NEW_ITEM + '\n        ' + html.slice(aStart);
          log.push('✅ More dropdown (fallback): Risk Management added');
          changed = true;
        }
      } else {
        log.push('⚠️  More dropdown: mm-admin anchor not found — skipped');
      }
    }
  } else if (mmAlreadyPatched) {
    log.push('ℹ️  More dropdown: already patched');
  } else {
    log.push('⚠️  More dropdown: more-menu not found in this file');
  }

  // ── 2. Sidebar patch ────────────────────────────────────────────────────────
  const hasSidebar = html.includes('class="sb-item"') || html.includes("class='sb-item'");
  const sbAlreadyPatched = html.includes(SB_GUARD) && html.includes('sb-item');

  if (hasSidebar && !sbAlreadyPatched) {
    if (SB_AUDIT_REGEX.test(html)) {
      html = html.replace(SB_AUDIT_REGEX, `$1\n          ${SB_NEW_ITEM}`);
      log.push('✅ Sidebar: Risk Management added after Audit & Compliance');
      changed = true;
    } else {
      // Fallback: find audit_compliance href in sidebar context
      const sbAuditStr = 'href="safetypro_audit_compliance';
      const idx = html.indexOf(sbAuditStr);
      if (idx !== -1) {
        // Find the closing </a> after this point
        const closeIdx = html.indexOf('</a>', idx);
        if (closeIdx !== -1) {
          html = html.slice(0, closeIdx + 4) + '\n          ' + SB_NEW_ITEM + html.slice(closeIdx + 4);
          log.push('✅ Sidebar (fallback): Risk Management added after Audit & Compliance');
          changed = true;
        }
      } else {
        log.push('⚠️  Sidebar: Audit & Compliance anchor not found — skipped');
      }
    }
  } else if (sbAlreadyPatched) {
    log.push('ℹ️  Sidebar: already patched');
  } else {
    log.push('⚠️  Sidebar: sb-item not found in this file');
  }

  // ── Write back ──────────────────────────────────────────────────────────────
  if (changed) {
    fs.writeFileSync(filename, html, 'utf8');
    patchedCount++;
    console.log(`\n📄 ${filename}`);
    log.forEach(l => console.log(`   ${l}`));
  } else {
    skippedCount++;
    console.log(`\n📄 ${filename}`);
    log.forEach(l => console.log(`   ${l}`));
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(55));
console.log(`✅ Patched : ${patchedCount} file(s)`);
console.log(`ℹ️  Skipped : ${skippedCount} file(s) (already patched or no nav)`);
console.log(`⚠️  Missing : ${missingCount} file(s) not found on disk`);
console.log('─'.repeat(55));
console.log('\nDone! Now run:');
console.log('  npx wrangler pages deploy . --project-name=safetypro-frontend');

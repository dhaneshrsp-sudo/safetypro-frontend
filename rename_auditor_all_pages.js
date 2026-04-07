/**
 * rename_auditor_all_pages.js
 * Replaces "Auditor Verification" → "Client & Auditor Portal" across ALL pages
 * - Topbar More dropdown
 * - Sidebar More section
 * - JS navigate functions
 * Run: cd C:\safetypro_complete_frontend && node rename_auditor_all_pages.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();

// All pages to update
const PAGES = [
  'safetypro_operations.html',
  'safetypro_control.html',
  'safetypro_reports.html',
  'safetypro_audit_compliance.html',
  'safetypro_documents.html',
  'safetypro_field.html',
  'safetypro_hrm.html',
  'safetypro_ai.html',
  'safetypro_auditor.html',
  'safetypro_admin.html',
  'safetypro_v2.html'
];

let totalFiles = 0, totalChanges = 0;

PAGES.forEach(function(filename) {
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) {
    console.log('SKIP (not found):', filename);
    return;
  }

  let html = fs.readFileSync(fp, 'utf8');
  const original = html;

  // ── Replacement 1: JS string context ──────────────────────────────────
  // 'Auditor Verification' → 'Client & Auditor Portal' (no HTML entities in JS)
  html = html.replace(/'Auditor Verification'/g, "'Client & Auditor Portal'");
  html = html.replace(/"Auditor Verification"/g, '"Client & Auditor Portal"');

  // ── Replacement 2: HTML text context ──────────────────────────────────
  // >Auditor Verification< → >Client &amp; Auditor Portal<
  // Covers: topbar mm-item, sidebar sb-item, any visible text
  html = html.replace(/Auditor Verification/g, 'Client &amp; Auditor Portal');

  // ── Replacement 3: Fix &amp; inside JS strings (overcorrect from step 2) ─
  // If step 2 replaced inside a JS string, fix back to & (no entity in JS)
  html = html.replace(/'Client &amp; Auditor Portal'/g, "'Client & Auditor Portal'");
  html = html.replace(/"Client &amp; Auditor Portal"/g, '"Client & Auditor Portal"');

  // ── Count changes ─────────────────────────────────────────────────────
  if (html !== original) {
    const bk = fp.replace('.html', '_bk_rename_' + Date.now() + '.html');
    fs.copyFileSync(fp, bk);
    fs.writeFileSync(fp, html, 'utf8');
    const changes = (original.match(/Auditor Verification/g) || []).length;
    console.log(`✅ ${filename}: ${changes} replacement(s)`);
    totalFiles++;
    totalChanges += changes;
  } else {
    console.log(`○  ${filename}: no changes needed`);
  }
});

console.log(`\nDone: ${totalFiles} files updated, ${totalChanges} total replacements`);
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

/**
 * patch_sidebar_riskmanagement_v4.js
 * Guard checks ONLY within #sb-more-items block.
 * Run from your HTML folder:  node patch_sidebar_riskmanagement_v4.js
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

function getSbMoreBlock(html) {
  const start = html.indexOf('id="sb-more-items"');
  if (start === -1) return '';
  const openDiv = html.lastIndexOf('<div', start);
  let depth = 0, i = openDiv;
  while (i < html.length) {
    if (html.startsWith('<div', i)) { depth++; i += 4; }
    else if (html.startsWith('</div>', i)) { depth--; if (depth === 0) return html.slice(openDiv, i + 6); i += 6; }
    else i++;
  }
  return html.slice(openDiv);
}

function alreadyPatched(html) {
  const block = getSbMoreBlock(html);
  return block.includes('safetypro_risk_management');
}

let patched = 0, skipped = 0, failed = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) {
    console.log(`MISSING: ${filename}`); failed++; continue;
  }

  let html = fs.readFileSync(filename, 'utf8');
  const log = [];

  if (alreadyPatched(html)) {
    log.push('INFO: Sidebar already patched in #sb-more-items');
    skipped++;
    console.log(`\nFILE: ${filename}`);
    log.forEach(l => console.log(`   ${l}`));
    continue;
  }

  const sbMoreStart = html.indexOf('id="sb-more-items"');
  const searchFrom = sbMoreStart !== -1 ? html.lastIndexOf('<div', sbMoreStart) : 0;
  let done = false;

  // Strategy A: after audit_compliance
  const auditIdx = html.indexOf('audit_compliance', searchFrom);
  if (!done && auditIdx !== -1) {
    const closeIdx = html.indexOf('</a>', auditIdx);
    if (closeIdx !== -1) {
      html = html.slice(0, closeIdx + 4) + '\n      ' + NEW_ITEM + html.slice(closeIdx + 4);
      log.push('PATCHED: inserted after Audit & Compliance');
      done = true;
    }
  }

  // Strategy B: before ESG
  if (!done) {
    const esgIdx = html.indexOf('safetypro_esg', searchFrom);
    if (esgIdx !== -1) {
      const aStart = html.lastIndexOf('<a', esgIdx);
      if (aStart !== -1) {
        html = html.slice(0, aStart) + NEW_ITEM + '\n      ' + html.slice(aStart);
        log.push('PATCHED: inserted before ESG (fallback)');
        done = true;
      }
    }
  }

  // Strategy C: before Admin
  if (!done) {
    const adminIdx = html.indexOf('safetypro_admin', searchFrom);
    if (adminIdx !== -1) {
      const aStart = html.lastIndexOf('<a', adminIdx);
      if (aStart !== -1) {
        html = html.slice(0, aStart) + NEW_ITEM + '\n      ' + html.slice(aStart);
        log.push('PATCHED: inserted before Admin (fallback 2)');
        done = true;
      }
    }
  }

  if (!done) {
    log.push('FAILED: No insertion point found');
    failed++;
  } else {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '-'.repeat(55));
console.log(`Patched: ${patched} file(s)`);
console.log(`Skipped: ${skipped} file(s)`);
console.log(`Failed:  ${failed} file(s)`);
console.log('-'.repeat(55));
console.log('\nDeploy:');
console.log('  npx wrangler pages deploy . --project-name=safetypro-frontend');

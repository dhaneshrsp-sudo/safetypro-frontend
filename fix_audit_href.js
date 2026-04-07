/**
 * fix_audit_href.js
 * ONLY ONE THING: Fix the Audit & Compliance href in sb-more-items on all pages
 * where it wrongly points to safetypro_reports instead of safetypro_audit_compliance
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  
  // Find sb-more-items section
  const sbStart = html.indexOf('id="sb-more-items"');
  if (sbStart < 0) { console.log('NO sb-more-items:', file); return; }
  
  // Find the closing div of sb-more-items
  let depth = 1, pos = html.indexOf('>', sbStart) + 1;
  while (depth > 0 && pos < html.length) {
    const nO = html.indexOf('<div', pos);
    const nC = html.indexOf('</div>', pos);
    if (nC >= 0 && (nO < 0 || nC < nO)) { depth--; pos = nC + 6; }
    else if (nO >= 0) { depth++; pos = nO + 4; }
    else break;
  }
  const sbEnd = pos;
  
  let sbChunk = html.slice(sbStart, sbEnd);
  const orig = sbChunk;
  
  // Fix ONLY: href="safetypro_reports" or href="safetypro_reports.html"
  // → href="safetypro_audit_compliance.html"
  // This is the Audit & Compliance link (first item) that was set wrong
  sbChunk = sbChunk.replace(
    /(<a[^>]*href=")safetypro_reports(?:\.html)?(")/,
    '$1safetypro_audit_compliance.html$2'
  );
  
  if (sbChunk !== orig) {
    const bk = fp.replace('.html','_bk_ah_'+Date.now()+'.html');
    fs.copyFileSync(fp, bk);
    html = html.slice(0, sbStart) + sbChunk + html.slice(sbEnd);
    fs.writeFileSync(fp, html, 'utf8');
    console.log('FIXED:', file);
  } else {
    console.log('ok (no change needed):', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

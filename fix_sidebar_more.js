/**
 * fix_sidebar_more.js
 * 1. Fix sidebar MORE links - wrong href values on all pages
 * 2. Apply sp-content-gap-fix to audit, field, hrm pages (missed earlier)
 * Run: cd C:\safetypro_complete_frontend && node fix_sidebar_more.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const ALL_PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// ── FIX 1: Sidebar sb-more-items links — fix wrong hrefs ──────────────────
// The sidebar Audit link incorrectly points to safetypro_reports.html
const HREF_FIXES = [
  // Wrong Audit href → correct
  [/href="safetypro_reports\.html"([^>]*>[\s\S]{0,50}Audit)/g,
   'href="safetypro_audit_compliance.html"$1'],
  // Ensure all sb-more-items hrefs are correct
  // Audit & Compliance
  [/(<a class="sb-item"[^>]*href=")safetypro_reports\.html("[^>]*>[\s\S]{0,80}Audit &amp; Compliance)/g,
   '$1safetypro_audit_compliance.html$2'],
];

// ── FIX 2: Card gap CSS — apply to missed pages ────────────────────────────
const GAP_CSS = `<style>
/* sp-content-gap-fix */
.sub-header {
  padding-left: 16px !important;
  padding-right: 16px !important;
}
.content > div:not(.sub-header):not([id]) {
  padding-left: 0 !important;
}
</style>`;

const GAP_PAGES = [
  'safetypro_audit_compliance.html',
  'safetypro_field.html',
  'safetypro_hrm.html'
];

ALL_PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_sbm_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  let changed = false;

  // Fix 1: sidebar link hrefs
  // More targeted: find sb-more-items div and fix hrefs inside it
  const sbStart = html.indexOf('id="sb-more-items"');
  if (sbStart >= 0) {
    // Find end of sb-more-items div
    let depth = 1, pos = html.indexOf('>', sbStart) + 1;
    while (depth > 0 && pos < html.length) {
      const nextOpen = html.indexOf('<div', pos);
      const nextClose = html.indexOf('</div>', pos);
      if (nextClose >= 0 && (nextOpen < 0 || nextClose < nextOpen)) {
        depth--; pos = nextClose + 6;
      } else if (nextOpen >= 0) {
        depth++; pos = nextOpen + 4;
      } else break;
    }
    const sbEnd = pos;
    let sbChunk = html.slice(sbStart, sbEnd);
    const sbOrig = sbChunk;

    // Fix Audit link href
    sbChunk = sbChunk.replace(
      /href="safetypro_reports\.html"([\s\S]{0,150}Audit)/g,
      'href="safetypro_audit_compliance.html"$1'
    );
    // Fix Site & Field Tools - ensure no .html since Cloudflare handles it
    sbChunk = sbChunk.replace(
      /href="safetypro_field"([\s\S]{0,100}Site)/g,
      'href="safetypro_field.html"$1'
    );
    // Fix Client & Auditor Portal
    sbChunk = sbChunk.replace(
      /href="safetypro_auditor"([\s\S]{0,100}Client)/g,
      'href="safetypro_auditor.html"$1'
    );

    if (sbChunk !== sbOrig) {
      html = html.slice(0, sbStart) + sbChunk + html.slice(sbEnd);
      changed = true;
      console.log('  Fixed sidebar MORE links in:', file);
    }
  }

  // Fix 2: card gap on missed pages
  if (GAP_PAGES.includes(file)) {
    let s = html.indexOf('<style>\n/* sp-content-gap-fix */');
    if(s<0) s = html.indexOf('<style>/* sp-content-gap-fix */');
    if(s>=0){const e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
    html = html.replace('</head>', GAP_CSS + '\n</head>');
    changed = true;
    console.log('  Applied gap fix to:', file);
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('SAVED:', file);
  } else {
    console.log('NO CHANGE:', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

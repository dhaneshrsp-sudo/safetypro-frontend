/**
 * fix_master.js — ONE SCRIPT to fix everything remaining:
 * 1. Sidebar sb-more-items: fix ALL wrong hrefs
 * 2. Card gap: apply to ALL pages that need it (audit, field, hrm + ensure others)
 * 3. Sidebar MORE toggle: reinforce with clean JS handler
 * Run: cd C:\safetypro_complete_frontend && node fix_master.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const ALL_PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// Card gap fix CSS
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

// Sidebar MORE clean JS handler
const SIDEBAR_JS = `<script>
/* sp-sidebar-more-fix */
(function() {
  function setupSidebarMore() {
    var btn = document.querySelector('.sb-more-btn');
    var items = document.getElementById('sb-more-items');
    var arr = document.getElementById('sb-more-arr');
    if (!btn || !items) return;
    // Clear inline onclick to avoid double-firing
    btn.removeAttribute('onclick');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = items.style.display === 'block';
      items.style.display = isOpen ? 'none' : 'block';
      if (arr) arr.style.transform = isOpen ? '' : 'rotate(180deg)';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarMore);
  } else {
    setupSidebarMore();
  }
})();
</script>`;

ALL_PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_master_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  let changed = false;

  // ── FIX 1: Sidebar sb-more-items hrefs ─────────────────────────────────
  // Find sb-more-items and replace ENTIRE block with correct hrefs
  const SB_OPEN = 'id="sb-more-items"';
  const sbPos = html.indexOf(SB_OPEN);
  if (sbPos >= 0) {
    // Find the closing </div> of sb-more-items
    let depth = 1, pos = html.indexOf('>', sbPos) + 1;
    while (depth > 0 && pos < html.length) {
      const nOpen = html.indexOf('<div', pos);
      const nClose = html.indexOf('</div>', pos);
      if (nClose >= 0 && (nOpen < 0 || nClose < nOpen)) {
        depth--; pos = nClose + 6;
      } else if (nOpen >= 0) {
        depth++; pos = nOpen + 4;
      } else break;
    }
    const sbEnd = pos;
    let sbChunk = html.slice(sbPos, sbEnd);
    const sbOrig = sbChunk;

    // Replace ALL wrong hrefs in sb-more-items
    // Audit: safetypro_reports.html → correct
    sbChunk = sbChunk.replace(/href="safetypro_reports\.html"/, 'href="safetypro_audit_compliance.html"');
    // Field: no .html → add .html  
    sbChunk = sbChunk.replace(/href="safetypro_field"([^a-z])/, 'href="safetypro_field.html"$1');
    // Auditor: no .html → add .html
    sbChunk = sbChunk.replace(/href="safetypro_auditor"([^a-z])/, 'href="safetypro_auditor.html"$1');
    // Ensure audit_compliance has .html
    sbChunk = sbChunk.replace(/href="safetypro_audit_compliance"([^a-z.])/, 'href="safetypro_audit_compliance.html"$1');

    if (sbChunk !== sbOrig) {
      html = html.slice(0, sbPos) + sbChunk + html.slice(sbEnd);
      changed = true;
      console.log('  Fixed sidebar hrefs in:', file);
    }
  }

  // ── FIX 2: Card gap CSS (all pages) ─────────────────────────────────────
  var s = html.indexOf('<style>\n/* sp-content-gap-fix */');
  if(s<0) s = html.indexOf('<style>/* sp-content-gap-fix */');
  if(s>=0){const e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
  html = html.replace('</head>', GAP_CSS + '\n</head>');
  changed = true;

  // ── FIX 3: Sidebar MORE JS handler (clean) ───────────────────────────────
  var sj = html.indexOf('<script>\n/* sp-sidebar-more-fix */');
  if(sj<0) sj = html.indexOf('<script>/* sp-sidebar-more-fix */');
  if(sj>=0){const ej=html.indexOf('</script>',sj)+9;html=html.slice(0,sj)+html.slice(ej);}
  html = html.replace('</body>', SIDEBAR_JS + '\n</body>');
  changed = true;

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('SAVED:', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

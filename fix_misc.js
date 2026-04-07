/**
 * fix_misc.js — 3 targeted fixes
 * 1. Documents/AI/Auditor: card gap — normalise sub-header + content padding
 * 2. HRM: remove subtitle text
 * 3. Auditor: rename "Client Portal" → "Client & Auditor Portal"
 * Run: cd C:\safetypro_complete_frontend && node fix_misc.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

function patch(file, fn) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  const orig = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_misc_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  const result = fn(orig);
  if (result !== orig) { fs.writeFileSync(fp, result, 'utf8'); console.log('FIXED:', file); }
  else { console.log('NO CHANGE:', file); }
}

// ── 1. CARD GAP FIX: Documents, AI, Auditor ────────────────────────────────
// Sub-header padding varies: AI=20px, Documents=12px. Normalise to 16px.
// Also set content wrapper padding-left:0 so cards use full width from sidebar.
const GAP_CSS = `<style>
/* sp-content-gap-fix */
/* Normalise sub-header horizontal padding to 16px across all pages */
.sub-header {
  padding-left: 16px !important;
  padding-right: 16px !important;
}
/* Remove extra left indent from content body wrappers */
.content > div:not(.sub-header):not([id]) {
  padding-left: 0 !important;
}
.content-inner, .page-inner, .tab-body {
  padding-left: 0 !important;
}
</style>`;

['safetypro_documents.html','safetypro_ai.html','safetypro_auditor.html'].forEach(function(f) {
  patch(f, function(html) {
    var s = html.indexOf('<style>\n/* sp-content-gap-fix */');
    if(s<0) s = html.indexOf('<style>/* sp-content-gap-fix */');
    if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
    return html.replace('</head>', GAP_CSS + '\n</head>');
  });
});

// ── 2. HRM: remove subtitle ─────────────────────────────────────────────────
patch('safetypro_hrm.html', function(html) {
  var OLD = '<div class="hrm-sub">Attendance &middot; Workers &middot; Payroll &middot; BOCW Compliance</div>';
  if (html.includes(OLD)) return html.replace(OLD, '');
  // Fallback regex
  return html.replace(/<div class="hrm-sub">[^<]+<\/div>/, '');
});

// ── 3. Auditor: rename title ────────────────────────────────────────────────
patch('safetypro_auditor.html', function(html) {
  // sh-title
  html = html.replace(
    '<div class="sh-title">Client Portal</div>',
    '<div class="sh-title">Client &amp; Auditor Portal</div>'
  );
  // Browser tab title
  html = html.replace(
    /<title>Client Portal(\s*[—\-|])/,
    '<title>Client &amp; Auditor Portal$1'
  );
  // Sub-header description text if it says "Client Portal"
  html = html.replace(
    /Client Portal(?!\s*[—|]|\s*&amp;|\s*and)/g,
    function(m, offset) {
      // Only replace in visible text context, not JS or CSS
      return 'Client &amp; Auditor Portal';
    }
  );
  return html;
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

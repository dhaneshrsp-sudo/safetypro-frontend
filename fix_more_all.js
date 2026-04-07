/**
 * fix_more_all.js — Definitive More dropdown fix for ALL pages
 * The more-menu is INSIDE more-wrap. Fix uses CSS class toggle with
 * a single clean event handler. No cloning (avoids stale references).
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// Unified CSS: more-menu shows when #more-btn has .open class
const MORE_CSS = `<style>
/* sp-more-fix-css */
/* More dropdown: hidden by default, shown when .open on wrapper */
#more-btn .more-menu,
.more-wrap .more-menu {
  display: none !important;
  position: absolute !important;
  top: calc(100% + 4px) !important;
  left: 0 !important;
  min-width: 200px !important;
  z-index: 99999 !important;
  background: #131C26 !important;
  border: 1px solid #334155 !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
  padding: 4px !important;
}
#more-btn.open .more-menu,
.more-wrap.open .more-menu {
  display: flex !important;
  flex-direction: column !important;
}
</style>`;

// Clean JS: override onclick without cloning
const MORE_JS = `<script>
/* sp-more-fix-js */
(function() {
  function init() {
    var btn = document.getElementById('more-btn') || document.querySelector('.more-wrap');
    if (!btn) return;

    // Override the inline onclick directly (no cloning)
    btn.onclick = null;
    btn.addEventListener('click', function(e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (btn.classList.contains('open')) {
        btn.classList.remove('open');
      } else {
        // Close all other dropdowns
        var pd = document.getElementById('profile-dropdown');
        var ad = document.getElementById('alert-dropdown');
        if (pd) pd.style.display = 'none';
        if (ad) ad.style.display = 'none';
        btn.classList.add('open');
      }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!btn.contains(e.target)) {
        btn.classList.remove('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

function patch(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_more2_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  // Remove old more-fix blocks
  ['sp-more-fix-css','sp-more-fix-js','sp-more-fix'].forEach(function(m) {
    var s = html.indexOf('<style>\n/* '+m+' */');
    if(s<0) s = html.indexOf('<style>/* '+m+' */');
    if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
    var sj = html.indexOf('<script>\n/* '+m+' */');
    if(sj<0) sj = html.indexOf('<script>/* '+m+' */');
    if(sj>=0){var ej=html.indexOf('</script>',sj)+9;html=html.slice(0,sj)+html.slice(ej);}
  });

  // Remove initMore function from navigation IIFE
  var imStart = html.indexOf('\n  function initMore()');
  if (imStart < 0) imStart = html.indexOf('\n    function initMore()');
  if (imStart >= 0) {
    var domCall = html.indexOf('initMore);', imStart);
    if (domCall >= 0) {
      html = html.slice(0, imStart) + html.slice(domCall + 'initMore);'.length);
      console.log('  Removed initMore IIFE');
    }
  }

  // Inject CSS before </head> and JS before </body>
  html = html.replace('</head>', MORE_CSS + '\n</head>');
  html = html.replace('</body>', MORE_JS + '\n</body>');

  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
}

PAGES.forEach(patch);
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

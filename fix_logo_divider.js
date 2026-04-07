/**
 * fix_logo_divider.js — Dynamic logo divider aligned with actual sidebar
 * Uses CSS variable --divider-x set by JS at runtime = sidebar.offsetWidth
 * Works on ALL pages regardless of sidebar width differences
 * Run: cd C:\safetypro_complete_frontend && node fix_logo_divider.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// CSS: uses CSS var --divider-x dynamically set by JS below
const CSS = `<style>
/* sp-logo-divider */
.topnav { position: relative !important; overflow: visible !important; }
.topnav::after {
  content: '' !important;
  position: absolute !important;
  left: var(--divider-x, 195px) !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 1px !important;
  background: #334155 !important;
  pointer-events: none !important;
  z-index: 1 !important;
}
/* Logo area constrained to sidebar width */
.topnav .logo, .topnav a.logo {
  max-width: calc(var(--divider-x, 195px) - 20px) !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}
</style>`;

// JS: sets --divider-x = sidebar.offsetWidth at runtime
// Runs immediately + on resize + after any layout shift
const JS = `<script>
/* sp-logo-divider-js */
(function() {
  function updateDivider() {
    var sb = document.querySelector('.sidebar');
    if (sb) {
      var w = sb.getBoundingClientRect().right || sb.offsetWidth;
      document.documentElement.style.setProperty('--divider-x', Math.round(w) + 'px');
    }
  }
  // Run immediately
  updateDivider();
  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDivider);
  }
  // Run after full load (fonts, images)
  window.addEventListener('load', updateDivider);
  // Run on resize
  window.addEventListener('resize', updateDivider);
})();
</script>`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_div2_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  // Remove old sp-logo-divider blocks (CSS + JS)
  var s = html.indexOf('<style>\n/* sp-logo-divider */');
  if(s<0) s = html.indexOf('<style>/* sp-logo-divider */');
  if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}

  var sj = html.indexOf('<script>\n/* sp-logo-divider-js */');
  if(sj<0) sj = html.indexOf('<script>/* sp-logo-divider-js */');
  if(sj>=0){var ej=html.indexOf('</script>',sj)+9;html=html.slice(0,sj)+html.slice(ej);}

  // Inject CSS before </head> and JS just before </body>
  html = html.replace('</head>', CSS + '\n</head>');
  html = html.replace('</body>', JS + '\n</body>');

  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

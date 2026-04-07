/**
 * fix_sb_links.js
 * Add a small script AFTER the navigation IIFE that fixes sb-more-items links.
 * Does NOT touch the IIFE — runs after it and overrides its click handlers
 * for #sb-more-items links only by using cloneNode to remove old listeners.
 * Run: cd C:\safetypro_complete_frontend && node fix_sb_links.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// Small script injected before </body>
// Runs after all other scripts, overrides click handlers for sb-more-items
const FIX = `<script>
/* sp-sb-link-fix */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('#sb-more-items .sb-item').forEach(function(el) {
    var href = el.getAttribute('href');
    if (!href) return;
    // Remove all existing listeners by replacing element with its clone
    var clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    // Add single clean click handler
    clone.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = clone.getAttribute('href');
    });
  });
});
</script>`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_sbfix_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  // Remove old version
  var s = html.indexOf('<script>\n/* sp-sb-link-fix */');
  if(s<0) s = html.indexOf('<script>/* sp-sb-link-fix */');
  if(s>=0){var e=html.indexOf('</script>',s)+9;html=html.slice(0,s)+html.slice(e);}

  // Inject before </body>
  html = html.replace('</body>', FIX + '\n</body>');
  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

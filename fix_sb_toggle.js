const fs = require('fs'), path = require('path');
const D = process.cwd();
const PAGES = ['safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'];

const FIX = `<script>
/* sp-sb-toggle-fix */
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.querySelector('.sb-more-btn');
  var items = document.getElementById('sb-more-items');
  var arr = document.getElementById('sb-more-arr');
  if (!btn || !items) return;
  btn.removeAttribute('onclick');
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = items.style.display === 'block';
    items.style.display = open ? 'none' : 'block';
    if (arr) arr.style.transform = open ? '' : 'rotate(180deg)';
  });
});
</script>`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  // Remove old version if exists
  let s = html.indexOf('<script>\n/* sp-sb-toggle-fix */');
  if (s >= 0) { const e = html.indexOf('</script>', s)+9; html = html.slice(0,s)+html.slice(e); }
  html = html.replace('</body>', FIX + '\n</body>');
  fs.writeFileSync(fp, html);
  console.log('FIXED:', file);
});
console.log('\nDone. Now run: npx wrangler pages deploy . --project-name safetypro-frontend');

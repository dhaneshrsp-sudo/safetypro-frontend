/**
 * patch_toggle_more.js
 * Finds pages missing toggleMore function and injects it.
 * Also injects sb-more-btn handler if missing.
 * Run from HTML folder: node patch_toggle_more.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// The nav toggle functions to inject if missing
const NAV_SCRIPT = `
<script>
/* Nav toggle functions */
function toggleMore(e){
  if(e){e.stopPropagation();}
  document.getElementById('more-btn').classList.toggle('open');
}
document.addEventListener('click', function(e){
  const moreBtn = document.getElementById('more-btn');
  if(moreBtn && !moreBtn.contains(e.target)){
    moreBtn.classList.remove('open');
  }
});
document.addEventListener('DOMContentLoaded', function(){
  const sbMoreBtn = document.querySelector('.sb-more-btn');
  const sbMoreItems = document.getElementById('sb-more-items');
  if(sbMoreBtn && sbMoreItems){
    sbMoreBtn.addEventListener('click', function(e){
      e.stopPropagation();
      const isOpen = sbMoreItems.style.display === 'block';
      sbMoreItems.style.display = isOpen ? 'none' : 'block';
      sbMoreBtn.classList.toggle('open', !isOpen);
    });
  }
});
</script>`;

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;

  const hasToggleMore = html.includes('function toggleMore') || html.includes('toggleMore=') || html.includes('toggleMore =');
  const hasSbMoreHandler = html.includes('sb-more-btn') && (html.includes("addEventListener('click'") || html.includes('addEventListener("click"'));

  if (hasToggleMore) {
    console.log(`\nFILE: ${filename}\n   ✅ toggleMore already defined — skipping`);
    skipped++;
    continue;
  }

  // Inject before </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', NAV_SCRIPT + '\n</body>');
  } else if (html.includes('</html>')) {
    html = html.replace('</html>', NAV_SCRIPT + '\n</html>');
  } else {
    html = html + NAV_SCRIPT;
  }

  fs.writeFileSync(filename, html, 'utf8');
  patched++;
  console.log(`\nFILE: ${filename}\n   ✅ toggleMore + sb-more-btn handler injected`);
}

console.log('\n' + '='.repeat(55));
console.log(`Patched: ${patched}  |  Skipped: ${skipped}`);
console.log('='.repeat(55));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

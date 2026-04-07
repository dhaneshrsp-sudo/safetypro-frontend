/**
 * SafetyPro AI — fix_all_pages.js
 * Fixes: scrollbar, gap, sticky, HRM margin, Admin More menu
 * Run: cd C:\safetypro_complete_frontend && node fix_all_pages.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();
const MARKER = '/* sp-v3 */';

// ── SHARED CSS: applied to all non-dashboard pages ────────────────
const SHARED_CSS = `<style>
${MARKER}
/* Fix .app growing beyond viewport */
.app{height:100vh!important;max-height:100vh!important;min-height:0!important;overflow:hidden!important;}
/* Fix .body constrained to below topnav */
.body{max-height:calc(100vh - 52px)!important;overflow:hidden!important;}
/* Fix sub-header gap */
.sub-header{top:0!important;}
/* Scrollbar — match dashboard */
.content{overflow-y:auto!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.content::-webkit-scrollbar{width:4px;}
.content::-webkit-scrollbar-thumb{background:var(--border,#1E293B);border-radius:2px;}
</style>`;

// ── HRM-ONLY CSS ────────────────────────────────────────────────
const HRM_CSS = `<style>
/* sp-hrm-fix */
.body{margin-top:0!important;}
</style>`;

// ── Pages and their special cases ──────────────────────────────
const CONFIGS = {
  'safetypro_operations.html': { shared: true },
  'safetypro_control.html':    { shared: true },
  'safetypro_reports.html':    { shared: true },
  'safetypro_admin.html':      { shared: true, fixMore: true },
  'safetypro_hrm.html':        { shared: true, hrmFix: true },
  'safetypro_field.html':      { shared: true },
  'safetypro_ai.html':         { shared: true },
  'safetypro_documents.html':  { shared: true },
  'safetypro_audit_compliance.html': { shared: true },
};

// ── Process each file ───────────────────────────────────────────
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && !f.includes('_bk_'));
let patched = 0, skipped = 0;

files.forEach(filename => {
  const config = CONFIGS[filename];
  if (!config) { skipped++; return; }

  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }

  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER)) { console.log('SKIP (v3 already):', filename); skipped++; return; }

  // Backup
  const bk = fp.replace('.html', '_bk_v3_' + Date.now() + '.html');
  fs.copyFileSync(fp, bk);

  // Find </head> — safe injection point
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) { console.log('SKIP (no </head>):', filename); return; }

  // Build injection
  let inject = '';
  if (config.shared) inject += SHARED_CSS + '\n';
  if (config.hrmFix) inject += HRM_CSS + '\n';

  html = html.slice(0, headEnd) + inject + html.slice(headEnd);

  // Fix Admin More menu — add HRM link if missing
  if (config.fixMore && !html.includes('safetypro_hrm') && html.includes('mm-item')) {
    const anchor = 'safetypro_audit_compliance';
    const hrmLink = `<a class="mm-item" href="safetypro_hrm.html">`
      + `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`
      + `HRM &amp; Payroll</a>`;
    // Insert after first mm-item
    html = html.replace(/<a class="mm-item"/, hrmLink + '\n        <a class="mm-item"');
    console.log('  + Added HRM to More menu:', filename);
  }

  // Fix Admin More button JS if toggleMore is missing
  if (config.fixMore) {
    const hasToggle = html.includes('toggleMore') || html.includes('toggleMoreMenu');
    if (!hasToggle && html.includes('more-wrap')) {
      // Add toggleMore JS before </body>
      const moreJS = `<script>
function toggleMore(){
  var menu=document.querySelector('.more-menu,.mm-menu');
  if(!menu)return;
  var isOpen=menu.style.display==='block'||menu.classList.contains('open');
  menu.style.display=isOpen?'none':'block';
  menu.classList.toggle('open',!isOpen);
}
document.addEventListener('click',function(e){
  var wrap=document.querySelector('.more-wrap');
  var menu=document.querySelector('.more-menu,.mm-menu');
  if(menu&&wrap&&!wrap.contains(e.target)){
    menu.style.display='none';
    menu.classList.remove('open');
  }
});
</script>`;
      html = html.replace('</body>', moreJS + '\n</body>');
      console.log('  + Added toggleMore JS:', filename);
    }
  }

  fs.writeFileSync(fp, html, 'utf8');
  console.log('PATCHED:', filename, '(' + Math.round(html.length/1024) + 'KB)');
  patched++;
});

console.log('\nPatched:', patched, '| Skipped:', skipped);
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

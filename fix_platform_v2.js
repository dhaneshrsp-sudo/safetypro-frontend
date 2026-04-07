/**
 * SafetyPro AI — fix_platform_v2.js
 * Comprehensive platform fix addressing ALL issues from the bug brief
 * Run: cd C:\safetypro_complete_frontend && node fix_platform_v2.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();
const MARKER = '/* sp-fix-v2 */';

// ── UNIVERSAL CSS ────────────────────────────────────────────────────────
// Fixes: footer visibility, sidebar direction, scrollbar, sub-header gap
const UNIVERSAL = `<style>
${MARKER}
/* Fix app: flex column, exact viewport, no overflow clip */
.app{display:flex!important;flex-direction:column!important;height:100vh!important;overflow:hidden!important;min-height:0!important;max-height:100vh!important;}
/* Topnav: fixed height */
.topnav{flex-shrink:0!important;height:52px!important;}
/* Body: flex ROW (sidebar + content side by side), fills space between topnav and footer */
.body{display:flex!important;flex-direction:row!important;flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;margin-top:0!important;max-height:none!important;}
/* Sidebar: full height, static positioning */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* Content: scrollable, flex column */
.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;display:flex!important;flex-direction:column!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.content::-webkit-scrollbar{width:4px!important;}
.content::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* Sub-header: no gap */
.sub-header{top:0!important;position:sticky!important;width:100%!important;box-sizing:border-box!important;}
/* Footer: always visible at bottom */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;width:100%!important;}
/* Header alignment: full width */
.page-header,.sh-header,.sh-left{width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
</style>`;

// ── PAGES TO FIX ─────────────────────────────────────────────────────────
const ALL_PAGES = [
  'safetypro_operations.html',
  'safetypro_control.html',
  'safetypro_reports.html',
  'safetypro_admin.html',
  'safetypro_hrm.html',
  'safetypro_documents.html',
  'safetypro_ai.html',
  'safetypro_auditor.html',
  'safetypro_field.html',
  'safetypro_audit_compliance.html',
];

let patched = 0;

ALL_PAGES.forEach(function(filename) {
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }

  let html = fs.readFileSync(fp, 'utf8');

  // Backup
  const bk = fp.replace('.html', '_bk_v2_' + Date.now() + '.html');
  fs.copyFileSync(fp, bk);

  // Remove old fix markers to avoid duplication
  const OLD = ['/* sp-v3 */', '/* sp-platform-fix */', '/* sp-height-fix */', '/* SafetyPro scrollbar v2 */', '/* SafetyPro scrollbar — matches dashboard */', '/* sp-fix-v2 */'];
  OLD.forEach(function(marker) {
    var startIdx = html.indexOf('<style>\n' + marker);
    if (startIdx >= 0) {
      var endIdx = html.indexOf('</style>', startIdx) + 8;
      html = html.slice(0, startIdx) + html.slice(endIdx);
    }
  });

  // Inject universal CSS before </head>
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) { console.log('No </head>:', filename); return; }
  html = html.slice(0, headEnd) + UNIVERSAL + '\n' + html.slice(headEnd);

  // ── ADMIN SPECIFIC FIXES ─────────────────────────────────────────────
  if (filename === 'safetypro_admin.html') {

    // Fix 1: Swapped sidebar links
    // "Reports" text → should link to safetypro_reports
    // "Audit & Compliance" text → should link to safetypro_audit_compliance
    // Find nav-link for Reports going to audit_compliance and fix it
    html = html.replace(
      /href="safetypro_audit_compliance"([^>]*>[^<]*(?:<[^>]+>[^<]*)*Reports)/g,
      'href="safetypro_reports.html"$1'
    );
    // Find nav-link for Audit going to reports and fix it
    html = html.replace(
      /href="safetypro_reports"([^>]*>[^<]*(?:<[^>]+>[^<]*)*Audit)/g,
      'href="safetypro_audit_compliance"$1'
    );

    // Fix 2: Add HRM to sidebar if missing
    if (!html.includes('safetypro_hrm') || !html.includes('HRM') && !html.includes('hrm')) {
      // Find the admin link and insert HRM before it
      const adminLinkIdx = html.indexOf('safetypro_admin.html');
      const aTagIdx = html.lastIndexOf('<a ', adminLinkIdx);
      if (aTagIdx > 0) {
        const hrmEntry = `<a href="safetypro_hrm.html" class="sb-link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label">HRM &amp; Payroll</span>
          </a>
          `;
        html = html.slice(0, aTagIdx) + hrmEntry + html.slice(aTagIdx);
        console.log('  + Added HRM to Admin sidebar');
      }
    }

    // Fix 3: Ensure toggleMore is properly defined
    if (!html.includes('window.toggleMore=') && !html.includes('window.toggleMore =')) {
      const moreJS = `<script>
(function(){
  window.toggleMore = function(e) {
    if(e) e.stopPropagation();
    var menu = document.querySelector('.more-menu');
    if(!menu) return;
    var isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
  };
  document.addEventListener('click', function(e) {
    var wrap = document.querySelector('.more-wrap');
    var menu = document.querySelector('.more-menu');
    if(menu && wrap && !wrap.contains(e.target)){
      menu.style.display = 'none';
    }
  });
})();
</script>`;
      html = html.replace('</body>', moreJS + '\n</body>');
    }

    console.log('  + Admin: fixed swapped links, More button, HRM link');
  }

  // ── AUDITOR PAGE: Rename heading ─────────────────────────────────────
  if (filename === 'safetypro_auditor.html') {
    // Replace "Auditor Verification" heading with "Client & Auditor Portal"
    html = html.replace(/Auditor Verification/g, 'Client &amp; Auditor Portal');
    html = html.replace(/Auditor &amp;amp; Verification/g, 'Client &amp; Auditor Portal');
    console.log('  + Auditor: renamed heading');
  }

  fs.writeFileSync(fp, html, 'utf8');
  console.log('PATCHED:', filename, '(' + Math.round(html.length/1024) + 'KB)');
  patched++;
});

console.log('\nTotal patched:', patched);
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

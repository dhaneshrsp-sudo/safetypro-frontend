/**
 * SafetyPro AI — fix_platform.js
 * Comprehensive fix for all platform pages
 * Run: cd C:\safetypro_complete_frontend && node fix_platform.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();
const MARKER = '/* sp-platform-fix */';

// ── UNIVERSAL CSS: fixes app/body/footer/scrollbar/gap ───────────────────
const UNIVERSAL_CSS = `<style>
${MARKER}
/* 1. App: flex column, exact viewport height */
.app{height:100vh!important;max-height:100vh!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 2. Topnav: fixed height */
.topnav{flex-shrink:0!important;height:52px!important;}
/* 3. Body: fills space between topnav and footer */
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;max-height:none!important;margin-top:0!important;}
/* 4. Content scrolls with dashboard-style scrollbar */
.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.content::-webkit-scrollbar{width:4px;}
.content::-webkit-scrollbar-thumb{background:var(--border,#1E293B);border-radius:2px;}
/* 5. Footer always visible at bottom */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
/* 6. Fix sub-header gap (was top:52px) */
.sub-header{top:0!important;position:sticky!important;}
/* 7. Sub-header full width */
.sub-header,.page-header{width:100%!important;box-sizing:border-box!important;}
/* 8. Sidebar full height from topnav to footer */
.sidebar{overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
</style>`;

// ── More menu toggle function (inject if missing) ─────────────────────────
const MORE_JS = `<script>
/* sp-more-fix */
(function(){
  function initMore(){
    var btn = document.querySelector('.more-wrap > button, .more-btn, [onclick*="toggleMore"]');
    var menu = document.querySelector('.more-menu');
    if(!menu) return;
    function toggle(e){
      if(e) e.stopPropagation();
      var open = menu.style.display === 'block';
      menu.style.display = open ? 'none' : 'block';
    }
    if(btn) btn.onclick = toggle;
    document.addEventListener('click', function(e){
      var wrap = document.querySelector('.more-wrap');
      if(wrap && !wrap.contains(e.target)){
        menu.style.display = 'none';
      }
    });
    // Also fix topnav More button
    var topMore = document.querySelector('.nav-links .more-wrap button, .nav-more');
    if(topMore) topMore.onclick = toggle;
  }
  window.toggleMore = function(e){ if(e) e.stopPropagation(); var m=document.querySelector('.more-menu'); if(m) m.style.display = m.style.display==='block'?'none':'block'; };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initMore);
  else initMore();
})();
</script>`;

// ── Per-page configs ─────────────────────────────────────────────────────
const PAGES = {
  'safetypro_operations.html': { fix: true },
  'safetypro_control.html':    { fix: true },
  'safetypro_reports.html':    { fix: true },
  'safetypro_admin.html':      { fix: true, fixLinks: true, fixMore: true },
  'safetypro_hrm.html':        { fix: true },
  'safetypro_documents.html':  { fix: true },
  'safetypro_ai.html':         { fix: true },
  'safetypro_auditor.html':    { fix: true },
  'safetypro_field.html':      { fix: true },
  'safetypro_audit_compliance.html': { fix: true },
};

let patched = 0;

Object.keys(PAGES).forEach(function(filename) {
  const cfg = PAGES[filename];
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }

  let html = fs.readFileSync(fp, 'utf8');

  // Backup
  const bk = fp.replace('.html','_bk_pf_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  // Remove any old sp-v3 / sp-v2 / scrollbar / height fix markers to start clean
  const OLD_MARKERS = ['/* sp-v3 */', '/* sp-height-fix */', '/* SafetyPro scrollbar v2 */', '/* SafetyPro scrollbar — matches dashboard */'];
  // We keep them but override with new CSS at end of head

  // Skip if already has platform fix
  if (html.includes(MARKER)) {
    // Remove old marker block and re-inject fresh
    const startIdx = html.indexOf('<style>\n'+MARKER);
    if (startIdx >= 0) {
      const endIdx = html.indexOf('</style>', startIdx) + 8;
      html = html.slice(0, startIdx) + html.slice(endIdx);
    }
  }

  // Find </head> insertion point
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) { console.log('No </head>:', filename); return; }

  // Build injection
  let inject = UNIVERSAL_CSS + '\n';

  html = html.slice(0, headEnd) + inject + html.slice(headEnd);

  // Fix More JS — inject before </body>
  if (cfg.fixMore || !html.includes('window.toggleMore')) {
    html = html.replace('</body>', MORE_JS + '\n</body>');
  }

  // Fix Admin swapped sidebar links
  if (cfg.fixLinks) {
    // Fix: "Reports" should link to safetypro_reports, "Audit & Compliance" to safetypro_audit_compliance
    // The swapped links:
    const swapped1 = html.indexOf('href="safetypro_audit_compliance"');
    const swapped2 = html.indexOf('href="safetypro_reports"');

    // Find the sidebar section (before content div)
    const contentIdx = html.indexOf('<div', html.indexOf('class="content"') - 10);
    const sidebarSection = html.substring(0, contentIdx);

    // In sidebar: fix Reports link (should go to safetypro_reports.html)
    // Current wrong: Reports → safetypro_audit_compliance
    // Pattern: href="safetypro_audit_compliance" near "Reports" text
    let sidebarFixed = sidebarSection;
    
    // Find nav-label "Reports" block and fix its href
    sidebarFixed = sidebarFixed.replace(
      /(<a[^>]+href=")safetypro_audit_compliance("[^>]*>(?:[^<]*<[^>]*>)*[^<]*[Rr]eports)/,
      '$1safetypro_reports.html$2'
    );
    // Find nav-label "Audit" block and fix its href
    sidebarFixed = sidebarFixed.replace(
      /(<a[^>]+href=")safetypro_reports("[^>]*>(?:[^<]*<[^>]*>)*[^<]*[Aa]udit)/,
      '$1safetypro_audit_compliance$2'
    );

    html = sidebarFixed + html.substring(contentIdx);

    // Add HRM link to sidebar if missing
    if (!sidebarFixed.includes('safetypro_hrm')) {
      const adminConfigLink = html.indexOf('safetypro_admin.html');
      if (adminConfigLink > 0) {
        // Find the <a> tag containing admin link and insert HRM before it
        const aTagStart = html.lastIndexOf('<a ', adminConfigLink);
        if (aTagStart > 0) {
          const hrmLink = `<a href="safetypro_hrm.html" class="sb-link"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="nav-label">HRM &amp; Payroll</span></a>\n          `;
          html = html.slice(0, aTagStart) + hrmLink + html.slice(aTagStart);
          console.log('  + Added HRM link to Admin sidebar');
        }
      }
    }

    console.log('  + Fixed swapped sidebar links in Admin');
  }

  fs.writeFileSync(fp, html, 'utf8');
  console.log('PATCHED:', filename, '('+Math.round(html.length/1024)+'KB)');
  patched++;
});

console.log('\nPatched:', patched, 'files');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

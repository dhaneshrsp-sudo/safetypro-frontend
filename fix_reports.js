/**
 * SafetyPro AI — fix_reports.js
 * REPORTS PAGE ONLY — surgical fix
 * Fixes: footer visible (same body-flex approach as Control)
 * Run: cd C:\safetypro_complete_frontend && node fix_reports.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_reports.html');

if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_reports.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');

const bk = fp.replace('.html', '_bk_rpt_' + Date.now() + '.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// Remove old fix blocks
const OLD = ['/* sp-v3 */', '/* sp-platform-fix */', '/* sp-height-fix */',
             '/* SafetyPro scrollbar v2 */', '/* SafetyPro scrollbar — matches dashboard */',
             '/* sp-fix-v2 */', '/* sp-rpt-fix */'];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n' + m);
  if (s < 0) s = html.indexOf('<style>' + m);
  if (s >= 0) {
    var e = html.indexOf('</style>', s);
    if (e >= 0) { html = html.slice(0, s) + html.slice(e + 8); console.log('Removed:', m); }
  }
});

// REPORTS FIX
// Structure: body > .app(topnav + .body) + footer  (same as Control)
// Fix: body flex-column, .app flex:1, footer visible
const FIX = `<style>
/* sp-rpt-fix */
/* 1. Body: flex column so .app + footer fit in 100vh */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 2. App: flex child, flex column internally */
.app{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;height:auto!important;max-height:none!important;}
/* 3. Topnav: fixed height */
.topnav{flex-shrink:0!important;height:52px!important;}
/* 4. Body div: flex row, sidebar + content */
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;}
/* 5. Sidebar: full height, no scrollbar */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* 6. Content: flex column, .main handles scroll */
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 7. Sub-header: sticky */
.sub-header{position:sticky!important;top:0!important;z-index:10!important;}
/* 8. Main: scrollable, thin 4px scrollbar */
.main{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.main::-webkit-scrollbar{width:4px!important;}
.main::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* 9. Footer: always visible */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
</style>
`;

var hi = html.indexOf('</head>');
if (hi < 0) { console.error('No </head> found'); process.exit(1); }
html = html.slice(0, hi) + FIX + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024) + 'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

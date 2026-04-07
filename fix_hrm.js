/**
 * SafetyPro AI — fix_hrm.js
 * HRM & Payroll — fixes all 5 issues:
 * 1. Body overlapping topnav (margin-top removed by old fix)
 * 2. Page not scrollable (panels overflow:hidden)
 * 3. HRM tab bar not sticky (content scrolls under it)
 * 4. Gate QR/Overtime/Payroll panels appear empty (overflow clipping)
 * 5. Sidebar 220px — reduce to 195px matching all other pages
 * Run: cd C:\safetypro_complete_frontend && node fix_hrm.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_hrm.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');
const bk = fp.replace('.html','_bk_hrm_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// Remove ALL old fix blocks
const OLD = ['/* sp-height-fix */', '/* sp-fix-v2 */', '/* sp-hrm-fix */'];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n'+m); if(s<0) s=html.indexOf('<style>'+m);
  if(s>=0){var e=html.indexOf('</style>',s);if(e>=0){html=html.slice(0,s)+html.slice(e+8);console.log('Removed:',m);}}
});

const FIX = `<style>
/* sp-hrm-fix */
/* ── 1+2+3: Layout — body properly below topnav, content scrolls ── */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
/* FIX 1: body below topnav — flex child, not margin-top hack */
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;
  display:flex!important;flex-direction:row!important;margin-top:0!important;}
/* FIX 5: Sidebar width 220→195 matching all other pages */
.sidebar{width:195px!important;flex-shrink:0!important;position:relative!important;
  height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* ── FIX 2+3+4: Content flex column — hrm-header sticky, panels scroll ── */
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;
  display:flex!important;flex-direction:column!important;}
/* FIX 3: HRM header bar sticky at top — tabs always visible */
.hrm-header{flex-shrink:0!important;position:sticky!important;top:0!important;z-index:10!important;}
/* FIX 2+4: Active panel fills remaining space and scrolls */
.hrm-panel{display:none!important;}
.hrm-panel.active{display:flex!important;flex-direction:column!important;
  flex:1 1 0%!important;min-height:0!important;
  overflow-y:auto!important;overflow-x:hidden!important;
  scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.hrm-panel.active::-webkit-scrollbar{width:4px!important;}
.hrm-panel.active::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* Footer */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + FIX + html.slice(hi);
fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024)+'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

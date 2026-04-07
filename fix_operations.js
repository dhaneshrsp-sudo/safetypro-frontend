/**
 * SafetyPro AI — fix_operations.js
 * OPERATIONS PAGE ONLY — surgical fix
 * Fixes: footer visible, header card full width, Quick Report panel not clipped
 * Run: cd C:\safetypro_complete_frontend && node fix_operations.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_operations.html');

if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_operations.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');

// Backup
const bk = fp.replace('.html', '_bk_ops_' + Date.now() + '.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// Remove ALL previous fix CSS blocks
const OLD = [
  '/* sp-v3 */', '/* sp-platform-fix */', '/* sp-height-fix */',
  '/* SafetyPro scrollbar v2 */', '/* SafetyPro scrollbar — matches dashboard */',
  '/* sp-fix-v2 */', '/* sp-ops-fix */', '/* sp-ops-grid-fix */'
];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n' + m);
  if (s < 0) s = html.indexOf('<style>' + m);
  if (s >= 0) {
    var e = html.indexOf('</style>', s);
    if (e >= 0) { html = html.slice(0, s) + html.slice(e + 8); console.log('Removed:', m); }
  }
});

// THE COMPLETE FIX
const FIX = `<style>
/* sp-ops-fix */
/* 1. Body layout: flex column — topnav(52) + content(flex:1) + footer fit in 100vh */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 2. Topnav: fixed height */
.topnav{flex-shrink:0!important;height:52px!important;}
/* 3. .body div: flex row — sidebar left, content right, fills remaining height */
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
/* 4. Sidebar: full height, no scrollbar visible */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* 5. Content: scrollable, thin 4px scrollbar matching dashboard */
.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.content::-webkit-scrollbar{width:4px!important;}
.content::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* 6. Sub-header: sticky at top, extends full width including 4px scrollbar lane */
.sub-header{position:sticky!important;top:0!important;width:calc(100% + 4px)!important;margin-right:-4px!important;box-sizing:border-box!important;z-index:10!important;}
/* 7. Footer: always visible at bottom */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
/* 8. Fix Quick Report / ops-grid: prevent right column from overflowing */
.main-area{min-width:0!important;overflow-x:hidden!important;}
.ops-grid{grid-template-columns:minmax(0,1fr) minmax(0,380px)!important;min-width:0!important;width:100%!important;}
.left-col,.right-col{min-width:0!important;overflow:hidden!important;}
</style>
`;

var hi = html.indexOf('</head>');
if (hi < 0) { console.error('No </head> found'); process.exit(1); }
html = html.slice(0, hi) + FIX + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024) + 'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

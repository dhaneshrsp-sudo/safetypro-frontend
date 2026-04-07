/**
 * SafetyPro AI — fix_control.js
 * CONTROL PAGE ONLY — surgical fix
 * Fixes: footer visible, page scrollable (tab content not clipped)
 * Run: cd C:\safetypro_complete_frontend && node fix_control.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_control.html');

if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_control.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');

// Backup
const bk = fp.replace('.html', '_bk_ctrl_' + Date.now() + '.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// Remove old fix blocks
const OLD = [
  '/* sp-v3 */', '/* sp-platform-fix */', '/* sp-height-fix */',
  '/* SafetyPro scrollbar v2 */', '/* SafetyPro scrollbar — matches dashboard */',
  '/* sp-fix-v2 */', '/* sp-ctrl-fix */'
];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n' + m);
  if (s < 0) s = html.indexOf('<style>' + m);
  if (s >= 0) {
    var e = html.indexOf('</style>', s);
    if (e >= 0) { html = html.slice(0, s) + html.slice(e + 8); console.log('Removed:', m); }
  }
});

// CONTROL PAGE FIX
// Structure: body > .app(topnav + .body) + footer
// .app has height:100vh from sp-fix-v2 — leaves no room for footer
// Fix: body is flex-column container, .app gets flex:1, footer gets its space
const FIX = `<style>
/* sp-ctrl-fix */
/* 1. Body: flex column — .app(flex:1) + footer fit in 100vh */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 2. App: flex child (NOT fixed 100vh), flex column internally */
.app{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;height:auto!important;max-height:none!important;}
/* 3. Topnav: fixed height */
.topnav{flex-shrink:0!important;height:52px!important;}
/* 4. Body div: flex row, fills remaining space inside .app */
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;}
/* 5. Sidebar: full height, no scrollbar */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* 6. Content: flex column, scrollbar on .main not .content */
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* 7. Sub-header: sticky at top */
.sub-header{position:sticky!important;top:0!important;z-index:10!important;}
/* 8. Main: scrollable area, thin scrollbar matching dashboard */
.main{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.main::-webkit-scrollbar{width:4px!important;}
.main::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* 9. Fix tab panel — was overflow:hidden which clipped content */
.tab-panel.active{overflow:visible!important;height:auto!important;max-height:none!important;}
/* 10. Footer: always visible at bottom */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
</style>
`;

var hi = html.indexOf('</head>');
if (hi < 0) { console.error('No </head> found'); process.exit(1); }
html = html.slice(0, hi) + FIX + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024) + 'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

// ── ADD ALIGNMENT IMPROVEMENTS ─────────────────────────────────────────────
// Read current file (already patched with sp-ctrl-fix), add alignment CSS
const html2 = fs.readFileSync(fp, 'utf8');
const ALIGN_MARKER = '/* sp-ctrl-align */';
if (!html2.includes(ALIGN_MARKER)) {
  const ALIGN_CSS = `<style>
${ALIGN_MARKER}
/* ── ACCOUNTABILITY: padding + row dividers ─────────────── */
#acc-list{padding:4px 16px 8px!important;}
#acc-list>div{border-bottom:1px solid var(--border,#1E293B)!important;padding:10px 0!important;}
#acc-list>div:last-child{border-bottom:none!important;}

/* ── SCENARIO PLANNER: projected impact improvements ────── */
/* Always 4 equal columns, no auto-collapse */
#tab-scenario .card div[style*="auto-fill"]{grid-template-columns:repeat(4,minmax(0,1fr))!important;}
/* Column separators */
#tab-scenario .card div[style*="auto-fill"]>div{border-right:1px solid var(--border,#1E293B);}
#tab-scenario .card div[style*="auto-fill"]>div:last-child{border-right:none!important;}
/* Fix tiny 9px sub-labels → 11px */
#tab-scenario .card div[style*="font-size:9px"]{font-size:11px!important;color:var(--t2,#94A3B8)!important;margin-top:6px!important;}
/* Fix 10px metric category labels → 11px */
#tab-scenario .card div[style*="font-size:10px"][style*="color:var(--t3)"]{font-size:11px!important;font-weight:600!important;margin-bottom:8px!important;}
/* Metric value font bump */
#tab-scenario .card div[style*="font-size:22px"]{font-size:24px!important;}
/* Card section titles: add bottom border + bump to 13px */
#tab-scenario .card>div[style*="font-size:12px"][style*="font-weight:700"]{font-size:13px!important;padding-bottom:10px!important;border-bottom:1px solid var(--border,#1E293B)!important;margin-bottom:14px!important;}
/* Recommended actions text: make readable */
#tab-scenario div[style*="display:flex;gap:10px;padding:10px"]>div:last-child{font-size:12px!important;color:var(--t1,#E6EDF3)!important;line-height:1.6!important;}
/* Left panel metric labels */
#tab-scenario .card label[style*="11px"]{font-size:12px!important;color:var(--t2,#94A3B8)!important;}
#tab-scenario .card span[style*="11px"][style*="font-weight:700"]{font-size:12px!important;}
/* NOTE card text */
#tab-scenario .card div[style*="line-height:1.7"]{font-size:11px!important;color:var(--t2,#94A3B8)!important;}
</style>
`;
  const hi2 = html2.indexOf('</head>');
  const updated = html2.slice(0, hi2) + ALIGN_CSS + html2.slice(hi2);
  fs.writeFileSync(fp, updated, 'utf8');
  console.log('Alignment CSS added:', Math.round(updated.length/1024) + 'KB');
} else {
  console.log('Alignment CSS already present');
}
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

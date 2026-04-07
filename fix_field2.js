/**
 * SafetyPro AI — fix_field2.js
 * Fixes:
 * 1. Extra divider line bleeding into footer (remove the hr div from sb-more-items)
 * 2. Sidebar MORE not scrollable — Admin clipped below fold
 * Run: cd C:\safetypro_complete_frontend && node fix_field2.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_field.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_field.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');

const bk = fp.replace('.html','_bk_field2_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// ── FIX 1: Remove the divider line inside sb-more-items ──────────────────
// This <div style="height:1px..."> sits between Auditor Verification and
// Admin & Configuration and bleeds into the footer zone
const divider = '<div style="height:1px;background:#1E293B;margin:6px 2px 4px"></div>';
if (html.includes(divider)) {
  html = html.replace(divider, '');
  console.log('Fix 1: Removed divider line from sb-more-items');
} else {
  // Try without closing tag
  const divider2 = '<div style="height:1px;background:#1E293B;margin:6px 2px 4px">';
  const pos = html.indexOf(divider2, html.indexOf('sb-more-items'));
  if (pos > 0) {
    const end = html.indexOf('</div>', pos) + 6;
    html = html.slice(0, pos) + html.slice(end);
    console.log('Fix 1 (alt): Removed divider line');
  } else {
    console.log('Fix 1: Divider not found — may already be removed');
  }
}

// ── FIX 2: Make sidebar scrollable so MORE items + Admin always reachable ─
// Remove old sp-field-fix and replace with updated version
const OLD = ['/* sp-field-fix */'];
OLD.forEach(function(m) {
  var s = html.indexOf('<style>\n'+m); if(s<0) s=html.indexOf('<style>'+m);
  if(s>=0){var e=html.indexOf('</style>',s);if(e>=0){html=html.slice(0,s)+html.slice(e+8);console.log('Removed:',m);}}
});

const FIX = `<style>
/* sp-field-fix */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
/* FIX 2: Sidebar scrollable — so MORE items incl. Admin always reachable */
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;min-height:0!important;overflow-y:auto!important;scrollbar-width:none!important;border-right:1px solid var(--border,#1E293B)!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
/* FIX 1: sb-more-items scrolls inside sidebar — no overflow into footer */
#sb-more-items{overflow:visible!important;max-height:none!important;}
/* Content */
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
/* Sub-header: single row, full width */
.sub-header{position:sticky!important;top:0!important;z-index:10!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;flex-wrap:nowrap!important;gap:0!important;width:calc(100% + 4px)!important;margin-right:-4px!important;box-sizing:border-box!important;}
/* Tab slider */
.sh-tabs{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-behavior:smooth!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;gap:2px!important;}
.sh-tabs::-webkit-scrollbar{display:none!important;}
.sh-tab{flex-shrink:0!important;white-space:nowrap!important;}
/* Tab panels */
.tab-panel{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.tab-panel::-webkit-scrollbar{width:4px!important;}
.tab-panel::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
/* Footer */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
/* FAB above footer */
#nm-fab{bottom:74px!important;}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + FIX + html.slice(hi);
console.log('Fix 2: Sidebar scrollable CSS updated');

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024)+'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

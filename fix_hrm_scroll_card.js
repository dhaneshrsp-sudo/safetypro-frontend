/**
 * fix_hrm_scroll_card.js
 * 1. Add grey color to Checked Out KPI card top line
 * 2. Fix scrollbar — remove conflicting rules, single clean visible scrollbar
 * Run: cd C:\safetypro_complete_frontend && node fix_hrm_scroll_card.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_sc_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// ── FIX 1: Add grey class to Checked Out card ─────────────────────────────
const OLD_CARD = '<div class="kpi"><div class="kpi-icon" style="background:rgba(148,163,184,.1);">';
const NEW_CARD = '<div class="kpi grey"><div class="kpi-icon" style="background:rgba(148,163,184,.1);">';
if (html.includes(OLD_CARD)) {
  html = html.replace(OLD_CARD, NEW_CARD);
  console.log('Fix 1: Added grey class to Checked Out card');
} else {
  console.log('Fix 1: WARNING — checked out card pattern not found');
}

// ── FIX 2: Remove all conflicting scrollbar fix blocks ─────────────────────
['/* sp-hrm-scrollbar-fix */'].forEach(function(m) {
  var s = html.indexOf('<style>' + m);
  if (s < 0) s = html.indexOf('<style>\n' + m);
  if (s >= 0) { var e = html.indexOf('</style>', s) + 8; html = html.slice(0,s) + html.slice(e); console.log('Removed:', m); }
});

// Also remove sp-hrm-fix block and replace with clean version
var s = html.indexOf('<style>\n/* sp-hrm-fix */');
if (s < 0) s = html.indexOf('<style>/* sp-hrm-fix */');
if (s >= 0) {
  var e = html.indexOf('</style>', s) + 8;
  html = html.slice(0, s) + html.slice(e);
  console.log('Removed: /* sp-hrm-fix */ for replacement');
}

// ── FIX 2: Single clean CSS block with visible scrollbar ───────────────────
const CLEAN_FIX = `<style>
/* sp-hrm-fix */
/* Layout */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
.sidebar{width:195px!important;flex-shrink:0!important;position:relative!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.hrm-header{flex-shrink:0!important;position:sticky!important;top:0!important;z-index:10!important;}
/* Panels */
.hrm-panel{display:none!important;}
.hrm-panel.active{
  display:flex!important;flex-direction:column!important;
  flex:1 1 0%!important;min-height:0!important;
  overflow-y:auto!important;overflow-x:hidden!important;
  /* Visible scrollbar — #475569 slate on dark bg */
  scrollbar-width:thin!important;
  scrollbar-color:#475569 transparent!important;
}
.hrm-panel.active::-webkit-scrollbar{width:6px!important;display:block!important;}
.hrm-panel.active::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)!important;border-radius:3px!important;}
.hrm-panel.active::-webkit-scrollbar-thumb{background:#475569!important;border-radius:3px!important;min-height:40px!important;}
.hrm-panel.active::-webkit-scrollbar-thumb:hover{background:#64748B!important;}
/* Footer */
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
/* FIX 1: Grey color for Checked Out card top line */
.kpi.grey::before{background:var(--t2,#94A3B8)!important;}
.kpi.grey .kpi-icon{background:rgba(148,163,184,.12)!important;}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + CLEAN_FIX + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Done —', Math.round(html.length/1024)+'KB');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

/**
 * fix_hrm_panels.js
 * ROOT CAUSE: panels have inline style="display:none!important" 
 * which beats any CSS class rule — hrmTab only toggles classes, never clears inline styles
 * 
 * FIXES:
 * 1. Remove inline styles from all hrm-panel elements in HTML
 * 2. Patch hrmTab() function to clear inline style when switching panels
 * 3. Ensure visible scrollbar on active panels
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_panels_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// FIX 1: Remove all inline style="display:none!important" from hrm-panel divs
// These were left by previous debug sessions and block panel switching
let count = 0;
html = html.replace(/<div((?:[^>](?!style))*?)id="hrm-panel-([^"]+)"([^>]*?)style="display:\s*none\s*!important;\s*"([^>]*)>/g,
  function(m, pre, id, mid, post) {
    count++;
    return `<div${pre}id="hrm-panel-${id}"${mid}${post}>`;
  }
);

// Also try the other attribute order
html = html.replace(/(<div[^>]+id="hrm-panel-[^"]+")[^>]*style="display:\s*none\s*!important;\s*"([^>]*>)/g,
  function(m, pre, post) {
    count++;
    return pre + post;
  }
);
console.log('Fix 1: Removed inline display:none!important from', count, 'panels');

// FIX 2: Patch hrmTab() function to ALSO clear inline style when switching
// Find the function and add style clearing after the classList operations
const OLD_FN = 'document.querySelectorAll(\'.hrm-panel\').forEach(function(p){p.classList.remove(\'active\');});';
const NEW_FN = 'document.querySelectorAll(\'.hrm-panel\').forEach(function(p){p.classList.remove(\'active\');p.style.cssText=\'\';});';
if (html.includes(OLD_FN)) {
  html = html.replace(OLD_FN, NEW_FN);
  console.log('Fix 2: hrmTab() patched to clear inline styles');
} else {
  console.log('Fix 2: WARNING - hrmTab pattern not found');
}

// FIX 3: Remove old sp-hrm-fix and replace with clean version (no inline style conflicts)
var s = html.indexOf('<style>\n/* sp-hrm-fix */');
if (s < 0) s = html.indexOf('<style>/* sp-hrm-fix */');
if (s >= 0) {
  var e = html.indexOf('</style>', s) + 8;
  html = html.slice(0, s) + html.slice(e);
  console.log('Fix 3: Removed old sp-hrm-fix');
}

const CLEAN_FIX = `<style>
/* sp-hrm-fix */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
.sidebar{width:195px!important;flex-shrink:0!important;position:relative!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
.content{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.hrm-header{flex-shrink:0!important;position:sticky!important;top:0!important;z-index:10!important;}
/* Panel switching — NOTE: do NOT use display:none!important here, use specificity only */
/* The hrmTab() JS clears inline styles, CSS class handles show/hide */
.hrm-panel{display:none;}
.hrm-panel.active{
  display:flex!important;flex-direction:column!important;
  flex:1 1 0%!important;min-height:0!important;
  overflow-y:auto!important;overflow-x:hidden!important;
  scrollbar-width:thin!important;
  scrollbar-color:#475569 rgba(255,255,255,0.05)!important;
}
.hrm-panel.active::-webkit-scrollbar{width:6px!important;display:block!important;}
.hrm-panel.active::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)!important;border-radius:3px!important;}
.hrm-panel.active::-webkit-scrollbar-thumb{background:#475569!important;border-radius:3px!important;min-height:40px!important;}
.hrm-panel.active::-webkit-scrollbar-thumb:hover{background:#64748B!important;}
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
/* Checked Out card grey top line */
.kpi.grey::before{background:var(--t2,#94A3B8)!important;}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + CLEAN_FIX + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Done:', Math.round(html.length/1024)+'KB');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

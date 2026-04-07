/**
 * fix_admin2.js — Admin page complete fixes
 * 1. Super Admin button: position:sticky so always visible at sidebar bottom
 * 2. Bell icon: ensure toggleAlerts works
 * 3. Border consistency: standardise all separator lines
 * Run: cd C:\safetypro_complete_frontend && node fix_admin2.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_admin.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_adm2_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// ── FIX 1: Super Admin button — sticky bottom (always visible) ─────────────
// Replace margin-top:auto wrapper with position:sticky;bottom:0
const OLD_SA = 'style="margin-top:auto;padding:10px 8px 6px;border-top:1px solid var(--border,#1E293B);">';
const NEW_SA = 'style="position:sticky;bottom:0;padding:10px 8px 6px;border-top:1px solid #334155;background:var(--sidebar,#0F1720);z-index:10;">';
if (html.includes(OLD_SA)) {
  html = html.replace(OLD_SA, NEW_SA);
  console.log('Fix 1: SA button → position:sticky bottom:0');
} else {
  console.log('Fix 1: Pattern not found — trying regex');
  html = html.replace(
    /style="margin-top:auto;padding:10px[^"]*"/,
    'style="position:sticky;bottom:0;padding:10px 8px 6px;border-top:1px solid #334155;background:var(--sidebar,#0F1720);z-index:10;"'
  );
}

// ── FIX 2: Remove old sp-admin-fix and replace with complete clean CSS ─────
var s = html.indexOf('<style>\n/* sp-admin-fix */');
if (s < 0) s = html.indexOf('<style>/* sp-admin-fix */');
if (s >= 0) { var e = html.indexOf('</style>',s)+8; html=html.slice(0,s)+html.slice(e); console.log('Removed old sp-admin-fix'); }

const ADMIN_CSS = `<style>
/* sp-admin-fix */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;}
/* Footer — always at page bottom, consistent border */
footer.sp-footer,.sp-footer{
  flex-shrink:0!important;display:flex!important;
  border-top:1px solid #334155!important;
}
/* Sidebar — flex column so sticky works, scrollable for more items */
.sidebar{
  display:flex!important;flex-direction:column!important;
  overflow-y:auto!important;
  scrollbar-width:none!important;
  position:relative!important;
}
.sidebar::-webkit-scrollbar{display:none!important;}
/* FIX 3: Border consistency — match topnav/sidebar/footer lines */
.topnav{border-bottom:1px solid #334155!important;}
/* Content scrollable */
.content{
  overflow-y:auto!important;overflow-x:hidden!important;
  scrollbar-width:thin;scrollbar-color:#475569 transparent;
}
.content::-webkit-scrollbar{width:6px;}
.content::-webkit-scrollbar-thumb{background:#475569;border-radius:3px;}
/* Tab panels scrollable */
.tab-panel{
  overflow-y:auto!important;
  scrollbar-width:thin;scrollbar-color:#475569 transparent;
}
.tab-panel::-webkit-scrollbar{width:6px;}
.tab-panel::-webkit-scrollbar-thumb{background:#475569;border-radius:3px;}
/* Bell alert panel */
#alert-panel{z-index:200!important;}
</style>
`;
var hi = html.indexOf('</head>');
html = html.slice(0,hi) + ADMIN_CSS + html.slice(hi);
console.log('Fix 2+3: CSS updated');

// ── FIX 3: Bell icon — ensure toggleAlerts is defined if missing ───────────
if (!html.includes('function toggleAlerts')) {
  const bellFix = `
<script>
if(typeof toggleAlerts==='undefined'){
  function toggleAlerts(){
    var p=document.getElementById('alert-panel');
    if(p){p.style.display=p.style.display==='none'?'block':'none';}
  }
}
</script>`;
  html = html.replace('</body>', bellFix + '\n</body>');
  console.log('Fix 3: Bell toggleAlerts defined');
} else {
  console.log('Fix 3: toggleAlerts already exists');
}

fs.writeFileSync(fp, html, 'utf8');
console.log('Done:', Math.round(html.length/1024)+'KB');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

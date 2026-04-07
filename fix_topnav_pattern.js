/**
 * fix_topnav_pattern.js — Universal topnav grid pattern
 * FIXED: nav-links overflow:visible so More dropdown isn't clipped
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();
const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

const CSS = `<style>
/* sp-topnav-pattern */
.topnav {
  display: grid !important;
  grid-template-columns: 195px 1fr auto !important;
  align-items: center !important;
  padding: 0 !important;
  height: 52px !important;
  overflow: visible !important;
  position: relative !important;
}
.topnav .logo, .topnav a.logo {
  width: 195px !important;
  min-width: 195px !important;
  max-width: 195px !important;
  height: 100% !important;
  padding: 0 16px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
  text-decoration: none !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  border-right: 1px solid #334155 !important;
}
.nav-links {
  padding-left: 12px !important;
  overflow: visible !important;
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  position: relative !important;
}
.nav-right {
  padding-right: 12px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 100% !important;
}
.sidebar { width: 195px !important; flex-shrink: 0 !important; }
.topnav::after { display: none !important; }
.sb-toggle { display: none !important; }
@media (max-width: 768px) { .sb-toggle { display: flex !important; } }
/* More dropdown — ensure it renders above everything */
.more-menu { z-index: 99998 !important; }
.more-wrap { position: relative !important; }
</style>`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_nav2_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  ['sp-logo-divider','sp-topnav-pattern'].forEach(function(m) {
    var s = html.indexOf('<style>\n/* '+m+' */');
    if(s<0) s = html.indexOf('<style>/* '+m+' */');
    if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
  });
  var sj = html.indexOf('<script>\n/* sp-logo-divider-js */');
  if(sj<0) sj = html.indexOf('<script>/* sp-logo-divider-js */');
  if(sj>=0){var ej=html.indexOf('</script>',sj)+9;html=html.slice(0,sj)+html.slice(ej);}
  html = html.replace('</head>', CSS + '\n</head>');
  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
});
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

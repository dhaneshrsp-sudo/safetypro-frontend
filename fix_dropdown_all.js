/**
 * fix_dropdown_all.js — Final dropdown fix
 * Problem: dropdown auto-sizes to content (82px) — no explicit width set
 * Fix: force width:300px on all pages
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
/* sp-dropdown-fix */
#alert-dropdown,.alert-dropdown,
#profile-dropdown,.profile-dd {
  position: fixed !important;
  z-index: 99999 !important;
  width: 300px !important;
  min-width: 300px !important;
  max-height: calc(100vh - 68px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: #131C26 !important;
  border: 1px solid #475569 !important;
  border-radius: 10px !important;
  box-shadow: 0 0 0 1px rgba(71,85,105,0.4), 0 8px 24px rgba(0,0,0,0.6) !important;
  scrollbar-width: thin;
  scrollbar-color: #475569 transparent;
}
#alert-dropdown::-webkit-scrollbar,
#profile-dropdown::-webkit-scrollbar { width: 4px; }
#alert-dropdown::-webkit-scrollbar-thumb,
#profile-dropdown::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
.topnav, nav.topnav { overflow: visible !important; }
</style>
`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_dd_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  var s = html.indexOf('<style>\n/* sp-dropdown-fix */');
  if(s<0) s = html.indexOf('<style>/* sp-dropdown-fix */');
  if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}
  html = html.replace('</head>', CSS + '</head>');
  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
});
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

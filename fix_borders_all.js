/**
 * fix_borders_all.js
 * Standardise topnav border-bottom + footer border-top to #334155 on all pages
 * so every page has consistent visible separator lines
 * Run: cd C:\safetypro_complete_frontend && node fix_borders_all.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();
const PAGES = ['safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'];

const BORDER_CSS = `<style>
/* sp-border-fix */
.topnav{border-bottom:1px solid #334155!important;}
.sidebar{border-right:1px solid #334155!important;}
footer.sp-footer,.sp-footer{border-top:1px solid #334155!important;}
</style>
`;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_brd_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);
  
  // Remove old border fix if exists
  var s = html.indexOf('<style>\n/* sp-border-fix */');
  if (s < 0) s = html.indexOf('<style>/* sp-border-fix */');
  if (s >= 0) { var e = html.indexOf('</style>',s)+8; html=html.slice(0,s)+html.slice(e); }
  
  // Add fresh border fix before </head>
  html = html.replace('</head>', BORDER_CSS + '</head>');
  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED:', file);
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

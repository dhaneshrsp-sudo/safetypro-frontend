/**
 * emergency_fix.js
 * Checks all HTML files for broken .body CSS and fixes by removing
 * any accidentally injected CSS that breaks the layout.
 * Also ensures scrollbar fix is clean.
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// The scrollbar fix CSS - SAFE version that does NOT touch layout
const SAFE_SCROLLBAR_CSS = `<style id="scrollbar-dropdown-fix">
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18)!important;border-radius:3px!important}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.32)!important}
#user-pill-btn{cursor:pointer;z-index:201;position:relative}
#profile-dropdown{z-index:99999!important}
</style>`;

// NOTE: Removed the dangerous rules:
// * { scrollbar-width: thin } - was fine
// .content { overflow-y: auto !important } - was potentially breaking layouts

let fixed = 0;

for (const file of FILES) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const orig = html;

  // Remove old scrollbar fix (may have bad rules)
  html = html.replace(/<style id="scrollbar-dropdown-fix">[\s\S]*?<\/style>/g, '');

  // Inject safe version before </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', SAFE_SCROLLBAR_CSS + '\n</head>');
  }

  if (html !== orig) {
    fs.writeFileSync(file, html, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixed++;
  } else {
    console.log(`ℹ️  No change: ${file}`);
  }
}

console.log(`\nFixed ${fixed} files.`);
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

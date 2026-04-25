/**
 * fix_scrollbar_dropdown.js
 * 1. Makes scrollbar visible (thumb was #162236 = invisible on dark bg)
 * 2. Ensures user dropdown click works on all pages
 * Run from HTML folder: node fix_scrollbar_dropdown.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// Inject this CSS to fix scrollbar visibility + dropdown click
const FIX_CSS = `
<style id="scrollbar-dropdown-fix">
/* ── Visible scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.18) !important;
  border-radius: 3px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.32) !important;
}
/* Firefox */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
/* Ensure .content scrollbar always visible when scrollable */
.content, .main-area, .ai-scroll, .hrm-scroll,
.field-scroll, .docs-scroll { overflow-y: auto !important; }
/* ── User dropdown — ensure clickable ── */
#user-pill-btn { cursor: pointer; position: relative; z-index: 201; }
#profile-dropdown { z-index: 99999 !important; }
</style>`;

let patched = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) continue;
  let html = fs.readFileSync(filename, 'utf8');
  if (html.includes('scrollbar-dropdown-fix')) { console.log(`ℹ️  ${filename}: already patched`); continue; }

  // Replace old invisible scrollbar rule with visible one
  // Old pattern: background: var(--border) !important on scrollbar-thumb
  html = html.replace(
    /\.content::-webkit-scrollbar-thumb[^{]*\{[^}]*background:\s*var\(--border\)[^}]*\}/g,
    '.content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18) !important; border-radius: 3px !important; }'
  );

  // Inject fix CSS before </head>
  html = html.replace('</head>', FIX_CSS + '\n</head>');
  fs.writeFileSync(filename, html, 'utf8');
  patched++;
  console.log(`✅ ${filename}`);
}

console.log(`\nPatched: ${patched} files`);
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

/**
 * fix_navigation.js
 * Fix navigation IIFE pages mapping on all pages
 * All More menu items were wrongly pointing to safetypro_admin.html
 * Run: cd C:\safetypro_complete_frontend && node fix_navigation.js
 */
const fs = require('fs'), path = require('path');
const D = process.cwd();

const PAGES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_audit_compliance.html','safetypro_documents.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_auditor.html','safetypro_admin.html'
];

// The correct pages mapping
const CORRECT_PAGES = `var pages = {
    'Dashboard':              'safetypro_v2.html',
    'Operations':             'safetypro_operations.html',
    'Control':                'safetypro_control.html',
    'Reports':                'safetypro_reports.html',
    'Audit & Compliance':     'safetypro_audit_compliance.html',
    'Documents & Records':    'safetypro_documents.html',
    'Site & Field Tools':     'safetypro_field.html',
    'HRM & Payroll':          'safetypro_hrm.html',
    'AI Intelligence':        'safetypro_ai.html',
    'Client & Auditor Portal':'safetypro_auditor.html',
    'Admin & Configuration':  'safetypro_admin.html',
    'Admin':                  'safetypro_admin.html',
  };`;

// Wrong pages block pattern to replace
const WRONG_PATTERN = /var pages\s*=\s*\{[^}]+\}/;

PAGES.forEach(function(file) {
  const fp = path.join(D, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  const bk = fp.replace('.html','_bk_nav_'+Date.now()+'.html');
  fs.copyFileSync(fp, bk);

  if (WRONG_PATTERN.test(html)) {
    html = html.replace(WRONG_PATTERN, CORRECT_PAGES);
    fs.writeFileSync(fp, html, 'utf8');
    console.log('FIXED:', file);
  } else {
    console.log('NO MATCH:', file);
  }
});

console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

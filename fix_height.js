/**
 * SafetyPro AI — fix_height.js
 * SURGICAL: adds ONE line to fix scrollbar on all non-dashboard pages
 * Root cause: html,body { height:auto !important } overrides viewport constraint
 * Fix: override it back with height:100% !important
 * Run: cd C:\safetypro_complete_frontend && node fix_height.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();

const MARKER = '/* sp-height-fix */';

// One line fix
const FIX = `<style>${MARKER}
html,body{height:100%!important;overflow:hidden!important;}
.body{height:calc(100vh - 52px)!important;overflow:hidden!important;}
</style>`;

// Skip dashboard (already works) and backups
const SKIP = ['safetypro_v2.html'];

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.html') && !f.includes('_bk_') && !SKIP.includes(f));

console.log('Pages to fix: ' + files.length);

files.forEach(filename => {
  const fp = path.join(DIR, filename);
  let html = fs.readFileSync(fp, 'utf8');

  if(html.includes(MARKER)){
    console.log('SKIP (already fixed): ' + filename);
    return;
  }

  // Insert right before </head> — safest spot, never inside JS
  const headEnd = html.indexOf('</head>');
  if(headEnd < 0){ console.log('SKIP (no </head>): ' + filename); return; }

  const bk = fp.replace('.html', '_bk_hfix_' + Date.now() + '.html');
  fs.copyFileSync(fp, bk);

  html = html.slice(0, headEnd) + FIX + '\n' + html.slice(headEnd);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('FIXED: ' + filename + ' (' + Math.round(html.length/1024) + 'KB)');
});

console.log('\nDone! Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');

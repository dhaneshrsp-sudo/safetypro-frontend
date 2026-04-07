/**
 * fix_hrm_scrollbar_always.js
 * Changes overflow-y:auto → overflow-y:scroll on active panels
 * so scrollbar is ALWAYS visible on right side (even when content fits)
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_sb_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// Find sp-hrm-fix block and change overflow-y:auto to overflow-y:scroll
const OLD = 'overflow-y:auto!important;overflow-x:hidden!important;\n  scrollbar-width:thin!important;\n  scrollbar-color:#475569 rgba(255,255,255,0.05)!important;';
const NEW = 'overflow-y:scroll!important;overflow-x:hidden!important;\n  scrollbar-width:thin!important;\n  scrollbar-color:#475569 rgba(255,255,255,0.05)!important;';

if (html.includes(OLD)) {
  html = html.replace(OLD, NEW);
  console.log('Changed overflow-y:auto → overflow-y:scroll on active panels');
} else {
  // Try simple replacement
  html = html.replace(
    /\.hrm-panel\.active\s*\{([^}]*?)overflow-y\s*:\s*auto\s*!important/,
    (m) => m.replace('overflow-y:auto!important','overflow-y:scroll!important')
  );
  console.log('Applied regex replacement');
}

fs.writeFileSync(fp, html, 'utf8');
console.log('Done → npx wrangler pages deploy . --project-name safetypro-frontend');

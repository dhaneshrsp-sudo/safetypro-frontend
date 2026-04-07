const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_rename_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// Exact pattern: SVG ends then "Workers<span" — replace Workers text only
const OLD = '</svg>Workers<span id="badge-workers"';
const NEW = '</svg>Employee Directory<span id="badge-workers"';

if (html.includes(OLD)) {
  html = html.replace(OLD, NEW);
  console.log('✅ Renamed: Workers → Employee Directory');
} else {
  console.log('❌ Pattern not found — check HTML');
}

fs.writeFileSync(fp, html, 'utf8');
console.log('Done → npx wrangler pages deploy . --project-name safetypro-frontend');

/**
 * SafetyPro AI — fix_hrm_final.js
 * Final HRM fixes:
 * 1. Rename "Workers" tab → "Employee Directory"
 * 2. Fix invisible scrollbars on all panels (dark color on dark bg)
 * 3. Verify all panel scrolls work correctly
 * Run: cd C:\safetypro_complete_frontend && node fix_hrm_final.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND: safetypro_hrm.html'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
console.log('Read:', Math.round(html.length/1024) + 'KB');
const bk = fp.replace('.html','_bk_hrm_final_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// ── FIX 1: Rename Workers tab label → Employee Directory ──────────────────
// The tab button has: hrmTab('workers',this)>...[SVG]...Workers</div>
// Only change the visible text, keep the SVG and onclick intact
const workerTabOld = ">Workers</div>";
const workerTabNew = ">Employee Directory</div>";
if (html.includes(workerTabOld)) {
  html = html.replace(workerTabOld, workerTabNew);
  console.log('Fix 1: Workers tab renamed to Employee Directory');
} else {
  // Try finding and replacing via regex - text might have whitespace
  const rx = /(hrmTab\('workers'[^>]*>(?:<svg[^>]*>.*?<\/svg>)?\s*)Workers(\s*<\/div>)/s;
  if (rx.test(html)) {
    html = html.replace(rx, '$1Employee Directory$2');
    console.log('Fix 1 (regex): Workers tab renamed to Employee Directory');
  } else {
    console.log('Fix 1: WARNING — could not find Workers tab text');
  }
}

// ── FIX 2: Remove old sp-hrm-scrollbar-fix if present ────────────────────
var s = html.indexOf('<style>/* sp-hrm-scrollbar-fix */');
if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);console.log('Removed old scrollbar fix');}

// ── FIX 2: Visible scrollbars on all HRM panels ───────────────────────────
// Root cause: scrollbar-color uses var(--border)=#1E293B which is dark navy
// on a dark #0B0F14 background — nearly invisible
// Fix: use #475569 (slate-600) for thumb — clearly visible on dark bg
const SCROLLBAR_FIX = `<style>
/* sp-hrm-scrollbar-fix */
/* Make scrollbars visible — var(--border) was too dark on dark background */
.hrm-panel.active {
  scrollbar-width: auto !important;
  scrollbar-color: #475569 transparent !important;
}
.hrm-panel.active::-webkit-scrollbar {
  width: 6px !important;
  display: block !important;
}
.hrm-panel.active::-webkit-scrollbar-track {
  background: transparent !important;
}
.hrm-panel.active::-webkit-scrollbar-thumb {
  background: #475569 !important;
  border-radius: 3px !important;
  min-height: 40px !important;
}
.hrm-panel.active::-webkit-scrollbar-thumb:hover {
  background: #64748B !important;
}
/* Also fix inner scrollable elements inside panels */
.hcard-body, .htable-wrap, [style*="overflow-y:auto"], [style*="overflow-y: auto"] {
  scrollbar-width: thin !important;
  scrollbar-color: #475569 transparent !important;
}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + SCROLLBAR_FIX + html.slice(hi);
console.log('Fix 2: Visible scrollbar CSS injected');

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024) + 'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

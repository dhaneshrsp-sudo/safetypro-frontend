/**
 * SafetyPro AI — fix_hrm2.js
 * HRM font + heading bar fixes:
 * 1. Font: Inter → Roboto (match all other pages)
 * 2. hrm-header: compact single-row like .sub-header on other pages
 * 3. .ht tabs: remove uppercase/letter-spacing, match sh-tab style
 * Run: cd C:\safetypro_complete_frontend && node fix_hrm2.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_hrm.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }

let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_hrm2_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);
console.log('Backup:', path.basename(bk));

// ── FIX 1: Font — replace Inter with Roboto in Google Fonts import ─────────
// HRM loads: Montserrat:wght@700;800;900&family=Inter:wght@400;500;600
// Others use: Montserrat + Roboto
html = html.replace(
  'Montserrat:wght@700;800;900&family=Inter:wght@400;500;600&display=swap',
  'Montserrat:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;600&display=swap'
);
console.log('Fix 1: Font import updated Inter → Roboto');

// ── FIX 1b: Update --fb CSS variable from Inter to Roboto ─────────────────
html = html.replace(
  "--fb:'Inter',sans-serif",
  "--fb:'Roboto',sans-serif"
);
html = html.replace(
  "--fb: 'Inter', sans-serif",
  "--fb: 'Roboto', sans-serif"
);
// Also catch inline variant
html = html.replace(/--fb\s*:\s*'Inter'/g, "--fb:'Roboto'");
console.log('Fix 1b: --fb variable updated');

// ── Remove old sp-hrm-font-fix if present ─────────────────────────────────
var s = html.indexOf('<style>/* sp-hrm-font-fix */');
if(s>=0){var e=html.indexOf('</style>',s)+8;html=html.slice(0,s)+html.slice(e);}

// ── FIX 2+3: CSS — compact header + fix tab style ─────────────────────────
const CSS = `<style>
/* sp-hrm-font-fix */
/* FIX 1: Force Roboto as body font (matches all other platform pages) */
body { font-family: 'Roboto', sans-serif !important; }

/* FIX 2: Compact hrm-header — match sub-header height on other pages */
.hrm-header {
  padding: 0 !important;
  background: var(--sidebar, #0F1720) !important;
  border-bottom: 1px solid var(--border, #1E293B) !important;
  /* Remove gradient background — keep consistent with platform */
  background-image: none !important;
}
.hrm-top {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 8px 20px !important;  /* was 16px 0 12px — too tall */
  gap: 12px !important;
}
/* HRM title styling — match .sh-title */
.hrm-title {
  font-family: var(--fh, 'Montserrat', sans-serif) !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--t1, #E6EDF3) !important;
}
.hrm-sub {
  font-size: 11px !important;
  color: var(--t2, #94A3B8) !important;
}
/* FIX 3: .ht tabs — match .sh-tab style on other pages */
/* Remove uppercase and letter-spacing — looks different from rest of platform */
.ht {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 6px 14px !important;
  color: var(--t2, #94A3B8) !important;
  border-radius: 6px !important;
}
.ht.active {
  font-weight: 600 !important;
  color: var(--t1, #E6EDF3) !important;
  background: var(--card, #131C26) !important;
}
/* hrm-tabs row — match sh-tabs style */
.hrm-tabs {
  padding: 0 20px 8px !important;
  gap: 2px !important;
}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + CSS + html.slice(hi);

fs.writeFileSync(fp, html, 'utf8');
console.log('Fixed:', Math.round(html.length/1024)+'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

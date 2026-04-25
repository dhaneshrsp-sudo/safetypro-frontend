const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: mt-filter-bar — no wrap, Export button right-aligned
// Find and update mt-filter-bar CSS
const mtCSS = content.indexOf('.mt-filter-bar .mt-export-btn');
if (mtCSS > -1) {
  // Find the .mt-filter-bar rule
  const ruleStart = content.lastIndexOf('.mt-filter-bar', mtCSS);
  console.log('Found mt-filter-bar at char:', ruleStart);
}

// Inject a clean override CSS before </head>
const fixCSS = `<style id="ac-layout-fix">
/* ── Filter bar: keep on one line, Export pinned right ── */
.mt-filter-bar {
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  align-items: center !important;
  gap: 6px !important;
  min-height: 40px !important;
  padding: 0 12px !important;
}
.mt-filter-bar::-webkit-scrollbar { display: none !important; }
.mt-filter-bar select { flex-shrink: 0 !important; min-width: 90px !important; max-width: 140px !important; font-size: 11px !important; }
.mt-export-btn { margin-left: auto !important; flex-shrink: 0 !important; }
.mt-clear-btn { flex-shrink: 0 !important; }

/* ── Context bar: wrap allowed, items compact ── */
#ims-ctx-bar { flex-wrap: wrap !important; gap: 6px !important; padding: 8px 12px !important; }
#ims-ctx-bar select { min-width: 100px !important; max-width: 150px !important; font-size: 11px !important; }
.ims-period-btn { padding: 3px 8px !important; font-size: 10px !important; }

/* ── Scroll fix: ac-ims scrolls, not the whole page ── */
#ac-ims { display: flex !important; flex-direction: column !important; flex: 1 1 0% !important; min-height: 0 !important; overflow: hidden !important; }
#ims-planning { flex: 1 1 0% !important; min-height: 0 !important; overflow-y: auto !important; display: flex !important; flex-direction: column !important; }
#ims-checklist, #ims-findings, #ims-ncr, #ims-actions, #ims-analytics { overflow-y: auto !important; min-height: 0 !important; }

/* ── KPI cards: don't overflow right ── */
#ims-planning > div { max-width: 100% !important; box-sizing: border-box !important; }
</style>`;

if (!content.includes('ac-layout-fix')) {
  content = content.replace('</head>', fixCSS + '\n</head>');
  console.log('✅ Layout fix CSS injected');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

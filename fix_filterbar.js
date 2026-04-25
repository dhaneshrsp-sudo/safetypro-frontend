const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Fix filter bar cut-off and improve alignment
const scrollFix = content.indexOf('<style id="ac-scroll-fix">');
const scrollEnd = content.indexOf('</style>', scrollFix) + 8;

const newScrollCSS = `<style id="ac-scroll-fix">
/* Scroll fix */
.tab-panel { min-height: 0 !important; }
.tab-panel.active { overflow-y: auto !important; min-height: 0 !important; flex: 1 1 0% !important; }
.ac-sub-panel.active { overflow-y: auto !important; min-height: 0 !important; }
#ac-ims { overflow-y: auto !important; }

/* Filter bar fix — prevent cut-off */
#ims-ctx-bar,
[id*="ctx-bar"],
.ims-filter-bar,
.ac-filter-strip { 
  flex-wrap: wrap !important; 
  overflow: visible !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Sub-filter row scrollable on small screens */
#ims-planning > div:first-child {
  overflow-x: auto !important;
  scrollbar-width: none !important;
}
#ims-planning > div:first-child::-webkit-scrollbar { display: none !important; }

/* All filter selects consistent size */
#ims-ctx-company, #ims-ctx-project, #ims-ctx-std, #ims-ctx-status {
  min-width: 110px !important;
  max-width: 160px !important;
  font-size: 11px !important;
}

/* Cards responsive grid */
.ac-kpi-row, [id*="kpi"] {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
  gap: 10px !important;
  width: 100% !important;
}
</style>`;

if (scrollFix > -1) {
  content = content.slice(0, scrollFix) + newScrollCSS + content.slice(scrollEnd);
  console.log('✅ CSS updated');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

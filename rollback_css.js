const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2"];

// SAFE block: only filter-bar rules. Works on all pages, harmless if no filter bar exists.
const SAFE_CSS = [
  '<style id="__SP_PAGE_FIXES__">',
  '/* Filter bar: horizontal drag-scroll, no visible scrollbar (scoped to .mt-filter-bar) */',
  '.mt-filter-bar {',
  '  flex-wrap: nowrap !important;',
  '  overflow-x: auto !important;',
  '  align-items: center !important;',
  '  cursor: grab;',
  '  scrollbar-width: none;',
  '  -ms-overflow-style: none;',
  '}',
  '.mt-filter-bar::-webkit-scrollbar { display: none; }',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

// FULL block: filter-bar + nested-flex release. Only for Risk Management.
const FULL_CSS = [
  '<style id="__SP_PAGE_FIXES__">',
  '.content { overflow-y: auto !important; }',
  '.tab-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.ac-sub-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.mt-filter-bar {',
  '  flex-wrap: nowrap !important;',
  '  overflow-x: auto !important;',
  '  align-items: center !important;',
  '  cursor: grab;',
  '  scrollbar-width: none;',
  '  -ms-overflow-style: none;',
  '}',
  '.mt-filter-bar::-webkit-scrollbar { display: none; }',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

const styleRx = /<style id="__SP_PAGE_FIXES__">[\s\S]*?<\/style>/;
const report = [];

// Apply SAFE_CSS to all 12 live pages
for (const pageKey of LIVE_PAGES) {
  const file = "safetypro_" + pageKey + ".html";
  if (!fs.existsSync(file)) { report.push({page: pageKey, action: "SKIP"}); continue; }
  fs.copyFileSync(file, file + ".bak.rollback." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  const m = styleRx.exec(html);
  if (!m) { report.push({page: pageKey, action: "no style block found"}); continue; }
  html = html.replace(styleRx, SAFE_CSS);
  fs.writeFileSync(file, html, "utf8");
  report.push({page: pageKey, action: "replaced with SAFE_CSS"});
}

// Put the FULL_CSS back on Risk Management (previous page-specific fix)
const rmFile = "safetypro_risk_management.html";
if (fs.existsSync(rmFile)) {
  fs.copyFileSync(rmFile, rmFile + ".bak.rollback." + Date.now());
  let html = fs.readFileSync(rmFile, "utf8");
  if (styleRx.test(html)) {
    html = html.replace(styleRx, FULL_CSS);
    fs.writeFileSync(rmFile, html, "utf8");
    report.push({page: "risk_management", action: "replaced with FULL_CSS (nested-flex release)"});
  }
}

console.log("\n=== ROLLBACK REPORT ===");
for (const r of report) console.log(r.page.padEnd(20), "->", r.action);

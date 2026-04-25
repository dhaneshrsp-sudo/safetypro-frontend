const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2"];

const SCROLL_AND_BORDER = [
  '/* Thin custom scrollbar (consistent across all pages) */',
  '.content, .sidebar, .mt-filter-bar { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.35) transparent; }',
  '.content::-webkit-scrollbar, .sidebar::-webkit-scrollbar { width: 8px; height: 8px; }',
  '.content::-webkit-scrollbar-track, .sidebar::-webkit-scrollbar-track { background: transparent; }',
  '.content::-webkit-scrollbar-thumb, .sidebar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 4px; }',
  '.content::-webkit-scrollbar-thumb:hover, .sidebar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.55); }',
  '/* Closing edges on header / filter / subnav strips for visual clarity */',
  '.topnav { border-bottom: 1px solid rgba(148,163,184,0.14) !important; }',
  '.subnav, .sub-header { border-bottom: 1px solid rgba(148,163,184,0.18) !important; }'
].join("\n");

const SAFE_CSS = [
  '<style id="__SP_PAGE_FIXES__">',
  SCROLL_AND_BORDER,
  '/* Filter bar: horizontal drag-scroll, no visible scrollbar (scoped to .mt-filter-bar) */',
  '.mt-filter-bar { flex-wrap: nowrap !important; overflow-x: auto !important; align-items: center !important; cursor: grab; scrollbar-width: none; -ms-overflow-style: none; }',
  '.mt-filter-bar::-webkit-scrollbar { display: none; }',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

const FULL_CSS = [
  '<style id="__SP_PAGE_FIXES__">',
  SCROLL_AND_BORDER,
  '.content { overflow-y: auto !important; }',
  '.tab-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.ac-sub-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.mt-filter-bar { flex-wrap: nowrap !important; overflow-x: auto !important; align-items: center !important; cursor: grab; scrollbar-width: none; -ms-overflow-style: none; }',
  '.mt-filter-bar::-webkit-scrollbar { display: none; }',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

const styleRx = /<style id="__SP_PAGE_FIXES__">[\s\S]*?<\/style>/;
const report = [];

for (const pageKey of LIVE_PAGES) {
  const file = "safetypro_" + pageKey + ".html";
  if (!fs.existsSync(file)) { report.push(pageKey + " MISSING"); continue; }
  fs.copyFileSync(file, file + ".bak.scrollstyle." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  if (!styleRx.test(html)) { report.push(pageKey + " no style block"); continue; }
  html = html.replace(styleRx, SAFE_CSS);
  fs.writeFileSync(file, html, "utf8");
  report.push(pageKey + " updated (SAFE)");
}

const rmFile = "safetypro_risk_management.html";
if (fs.existsSync(rmFile)) {
  fs.copyFileSync(rmFile, rmFile + ".bak.scrollstyle." + Date.now());
  let html = fs.readFileSync(rmFile, "utf8");
  if (styleRx.test(html)) {
    html = html.replace(styleRx, FULL_CSS);
    fs.writeFileSync(rmFile, html, "utf8");
    report.push("risk_management updated (FULL)");
  }
}

console.log("\n=== STYLE UPDATE REPORT ===");
report.forEach(r => console.log("  " + r));

const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2"];

// Operations-aligned scrollbar + border (slate-800 thumb, slate-700 border)
const SCROLL_AND_BORDER = [
  '/* Scrollbar: match Operations page palette (slate-800 thumb on transparent track) */',
  '.content, .sidebar { scrollbar-width: thin; scrollbar-color: rgb(30, 41, 59) transparent; }',
  '.content::-webkit-scrollbar, .sidebar::-webkit-scrollbar { width: 8px; height: 8px; }',
  '.content::-webkit-scrollbar-track, .sidebar::-webkit-scrollbar-track { background: transparent; }',
  '.content::-webkit-scrollbar-thumb, .sidebar::-webkit-scrollbar-thumb { background: rgb(30, 41, 59); border-radius: 4px; }',
  '.content::-webkit-scrollbar-thumb:hover, .sidebar::-webkit-scrollbar-thumb:hover { background: rgb(51, 65, 85); }',
  '/* Closing edge on topnav + header/filter strip (slate-700) */',
  '.topnav { border-bottom: 1px solid rgb(51, 65, 85) !important; }',
  '.subnav, .sub-header, .page-header, .content-header, .filter-bar, .rpt-filter-bar { border-bottom: 1px solid rgb(51, 65, 85) !important; }'
].join("\n");

const SAFE_CSS = [
  '<style id="__SP_PAGE_FIXES__">',
  SCROLL_AND_BORDER,
  '/* Horizontal drag-scroll filter bar (no visible scrollbar) */',
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
for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  fs.copyFileSync(file, file + ".bak.ops." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  if (!styleRx.test(html)) { report.push(p + " no style block"); continue; }
  html = html.replace(styleRx, SAFE_CSS);
  fs.writeFileSync(file, html, "utf8");
  report.push(p);
}
const rm = "safetypro_risk_management.html";
if (fs.existsSync(rm)) {
  fs.copyFileSync(rm, rm + ".bak.ops." + Date.now());
  let html = fs.readFileSync(rm, "utf8");
  html = html.replace(styleRx, FULL_CSS);
  fs.writeFileSync(rm, html, "utf8");
  report.push("risk_management (FULL)");
}
console.log("Updated: " + report.join(", "));

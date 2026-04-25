const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

const styleRx = /<style id="__SP_PAGE_FIXES__">[\s\S]*?<\/style>/;
const newStyle = [
  '<style id="__SP_PAGE_FIXES__">',
  '/* Single page-level scroll at .content */',
  '.content { overflow-y: auto !important; }',
  '/* Release flex-pinned heights so content flows to .content and scrolls there */',
  '.tab-panel {',
  '  flex: 0 0 auto !important;',
  '  overflow-y: visible !important;',
  '  max-height: none !important;',
  '  height: auto !important;',
  '}',
  '.ac-sub-panel {',
  '  flex: 0 0 auto !important;',
  '  overflow-y: visible !important;',
  '  max-height: none !important;',
  '  height: auto !important;',
  '}',
  '/* Filter bar: horizontal drag-scroll, no visible scrollbar */',
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

if (styleRx.test(html)) {
  html = html.replace(styleRx, newStyle);
  console.log("Updated __SP_PAGE_FIXES__");
} else {
  const headEnd = html.indexOf("</head>");
  html = html.slice(0, headEnd) + newStyle + "\n" + html.slice(headEnd);
  console.log("Injected __SP_PAGE_FIXES__");
}

fs.writeFileSync(path, html, "utf8");
console.log("File size:", html.length);

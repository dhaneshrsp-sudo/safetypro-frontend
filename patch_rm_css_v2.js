const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

// Replace the __SP_PAGE_FIXES__ block with an improved one
const styleRx = /<style id="__SP_PAGE_FIXES__">[\s\S]*?<\/style>/;
const newStyle = [
  '<style id="__SP_PAGE_FIXES__">',
  '/* Issue 2: single page-level scroll at .content — release nested containers */',
  '.content { overflow-y: auto !important; }',
  '.tab-panel { overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.ac-sub-panel { overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '/* Issue 3: filter row stays one line, Clear+Export pushed to the right edge */',
  '.mt-filter-bar { flex-wrap: nowrap !important; overflow-x: auto !important; align-items: center !important; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

if (styleRx.test(html)) {
  html = html.replace(styleRx, newStyle);
  console.log("Updated __SP_PAGE_FIXES__ CSS block");
} else {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) { console.error("no </head>"); process.exit(1); }
  html = html.slice(0, headEnd) + newStyle + "\n" + html.slice(headEnd);
  console.log("Injected __SP_PAGE_FIXES__ CSS block");
}

fs.writeFileSync(path, html, "utf8");
console.log("File size:", html.length);

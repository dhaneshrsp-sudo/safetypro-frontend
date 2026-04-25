const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");
const changes = [];

// === FIX 1: unwrap RM anchor from 1px separator div ===
// Match: <div style="height:1px;background:#1E293B;margin:10px 2px 6px"> ... <a ...>...Risk Management...</a> ... </div>
// Replace with empty separator
const sepRx = /(<div\s+style="height:1px;background:#1E293B;margin:10px 2px 6px">)\s*<a[^>]*class="sb-item"[^>]*>[\s\S]*?Risk Management[\s\S]*?<\/a>\s*(<\/div>)/;
if (sepRx.test(html)) {
  html = html.replace(sepRx, "$1$2");
  changes.push("unwrapped RM anchor from separator");
} else {
  console.log("(separator pattern not matched - already clean?)");
}

// === FIX 2 & 3: inject CSS overrides before </head> ===
if (!html.includes("__SP_PAGE_FIXES__")) {
  const styleBlock = [
    '<style id="__SP_PAGE_FIXES__">',
    '/* Issue 2: allow vertical scroll in main content area */',
    '.content { overflow-y: auto !important; }',
    '/* Issue 3: keep filter row on one line with horizontal scroll fallback */',
    '.mt-filter-bar { flex-wrap: nowrap !important; overflow-x: auto !important; }',
    '.mt-filter-bar > * { flex-shrink: 0; }',
    '</style>'
  ].join("\n");
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) { console.error("no </head>"); process.exit(1); }
  html = html.slice(0, headEnd) + styleBlock + "\n" + html.slice(headEnd);
  changes.push("injected __SP_PAGE_FIXES__ CSS");
} else {
  console.log("(page fixes CSS already present)");
}

fs.writeFileSync(path, html, "utf8");
console.log("Changes:", changes.length ? changes.join(" | ") : "NONE");

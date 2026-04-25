const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let fixed = 0;
let already = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Remove any previous broken .body rule we injected
  html = html.replace(/\n?\.body \{ margin-top: 0 !important; \}\n?/g, "\n");
  // Insert a fresh, clean rule inside the style block - before the closing </style>
  const styleCloseRx = /<\/style>(?=\s*(?:<script|<\/head>))/;
  // Target the specific SP_PAGE_FIXES style block
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => {
    if (body.includes(".body{margin-top:0!important")) { already++; return m; }
    return body + ".body{margin-top:0!important;}\n" + close;
  });
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); fixed++; }
}
console.log("Fixed: " + fixed + ", already had rule: " + already);

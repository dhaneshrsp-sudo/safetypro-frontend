const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let updated = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  // Bump thumb opacity 0.3 -> 0.5 and hover 0.55 -> 0.75
  const before = html;
  html = html.replace(/scrollbar-thumb \{ background: rgba\(148,163,184,0\.3\)/g, "scrollbar-thumb { background: rgba(148,163,184,0.5)");
  html = html.replace(/scrollbar-thumb:hover \{ background: rgba\(148,163,184,0\.55\)/g, "scrollbar-thumb:hover { background: rgba(148,163,184,0.75)");
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); updated++; }
}
console.log("Updated scrollbar opacity on " + updated + " files");

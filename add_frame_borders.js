const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
const RULES = [
  ".topnav{border-left:1px solid rgb(51, 65, 85)!important;}",
  ".sidebar{border-left:1px solid rgb(51, 65, 85)!important;}",
  ".sp-footer{border-left:1px solid rgb(51, 65, 85)!important;border-right:1px solid rgb(51, 65, 85)!important;}"
].join("\n") + "\n";

let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes(".sp-footer{border-left:1px solid rgb(51, 65, 85)")) continue;
  const before = html;
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => body + RULES + close);
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Added left + footer borders on " + done + " files");

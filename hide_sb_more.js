const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
const RULE = "#sb-more-items{scrollbar-width:none!important;-ms-overflow-style:none!important;overflow-y:auto!important;}\n#sb-more-items::-webkit-scrollbar{display:none!important;}\n";
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("#sb-more-items{scrollbar-width:none")) continue;
  const before = html;
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => body + RULE + close);
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Hidden sb-more-items scrollbar on " + done + " files");

const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add .body { margin-top: 0 !important } rule next to the topnav border rule
  html = html.replace(
    /\.topnav \{ border-bottom: 1px solid rgb\(51, 65, 85\) !important; \}/,
    ".topnav { border-bottom: 1px solid rgb(51, 65, 85) !important; }\n.body { margin-top: 0 !important; }"
  );
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Added body margin-top override on " + done + " files");

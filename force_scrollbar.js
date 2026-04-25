const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add !important to scrollbar-color rule
  html = html.replace(
    /\.content, \.sidebar \{ scrollbar-width: thin; scrollbar-color: rgb\(30, 41, 59\) transparent; \}/,
    '.content, .sidebar { scrollbar-width: thin !important; scrollbar-color: rgb(30, 41, 59) transparent !important; }'
  );
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Added !important on " + done + " files");

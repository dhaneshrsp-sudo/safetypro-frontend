const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add .hrm-header to the header border selector list
  html = html.replace(
    /\.subnav, \.sub-header, \.page-header, \.content-header, \.filter-bar, \.rpt-filter-bar \{/g,
    '.subnav, .sub-header, .hrm-header, .page-header, .content-header, .filter-bar, .rpt-filter-bar {'
  );
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Added .hrm-header to " + done + " files");

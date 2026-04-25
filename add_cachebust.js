const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
const META = '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n<meta http-equiv="Pragma" content="no-cache">\n<meta http-equiv="Expires" content="0">';
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('http-equiv="Cache-Control"')) continue;
  const before = html;
  html = html.replace(/<head>/i, '<head>\n' + META);
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Added cache-bust meta to " + done + " files");

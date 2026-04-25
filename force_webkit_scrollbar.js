const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = html.replace(
    /\.content::-webkit-scrollbar \{ width: 8px; height: 8px; \}/,
    '.content::-webkit-scrollbar { width: 8px !important; height: 8px !important; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-track \{ background: transparent; \}/,
    '.content::-webkit-scrollbar-track { background: transparent !important; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-thumb \{ background: rgb\(30, 41, 59\); border-radius: 4px; \}/,
    '.content::-webkit-scrollbar-thumb { background: rgb(30, 41, 59) !important; border-radius: 4px !important; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-thumb:hover \{ background: rgb\(51, 65, 85\); \}/,
    '.content::-webkit-scrollbar-thumb:hover { background: rgb(51, 65, 85) !important; }'
  );
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Forced !important on webkit scrollbar rules: " + done + " files");

const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_(admin|ai|audit_compliance|auditor|control|documents|esg|field|hrm|operations|reports|v2|risk_management)\.html$/.test(f));
let done = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Replace the combined .content, .sidebar scrollbar rules with split rules
  html = html.replace(
    /\.content, \.sidebar \{ scrollbar-width: thin !important; scrollbar-color: rgb\(30, 41, 59\) transparent !important; \}/,
    '.content { scrollbar-width: thin !important; scrollbar-color: rgb(30, 41, 59) transparent !important; }\n.sidebar { scrollbar-width: none !important; -ms-overflow-style: none !important; }\n.sidebar::-webkit-scrollbar { display: none !important; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar, \.sidebar::-webkit-scrollbar \{ width: 8px; height: 8px; \}/,
    '.content::-webkit-scrollbar { width: 8px; height: 8px; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-track, \.sidebar::-webkit-scrollbar-track \{ background: transparent; \}/,
    '.content::-webkit-scrollbar-track { background: transparent; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-thumb, \.sidebar::-webkit-scrollbar-thumb \{ background: rgb\(30, 41, 59\); border-radius: 4px; \}/,
    '.content::-webkit-scrollbar-thumb { background: rgb(30, 41, 59); border-radius: 4px; }'
  );
  html = html.replace(
    /\.content::-webkit-scrollbar-thumb:hover, \.sidebar::-webkit-scrollbar-thumb:hover \{ background: rgb\(51, 65, 85\); \}/,
    '.content::-webkit-scrollbar-thumb:hover { background: rgb(51, 65, 85); }'
  );
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); done++; }
}
console.log("Sidebar scrollbar hidden on " + done + " files");

const fs = require("fs");
const files = fs.readdirSync(".").filter(f => /^safetypro_hrm\.html$/.test(f));
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  // Add icon-shrink rule to our style block, before </style>
  const rule = ".hrm-icon{width:28px!important;height:28px!important;border-radius:8px!important;}\n.hrm-icon svg{width:16px!important;height:16px!important;}\n";
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => {
    if (body.includes(".hrm-icon{width:28px")) return m;
    return body + rule + close;
  });
  if (html !== before) { fs.writeFileSync(file, html, "utf8"); console.log("patched " + file); }
  else { console.log("no change " + file); }
}

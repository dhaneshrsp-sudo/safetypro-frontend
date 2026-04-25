const fs = require("fs");
const file = "safetypro_hrm.html";
let html = fs.readFileSync(file, "utf8");
fs.copyFileSync(file, file + ".bak.fontfix." + Date.now());
const RULES = [
  "/* HRM font alignment with Operations baseline */",
  "body{font-size:13px!important;}",
  ".kpi-val{font-size:22px!important;}",
  ""
].join("\n");
if (!html.includes("/* HRM font alignment with Operations")) {
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => body + RULES + close);
  fs.writeFileSync(file, html, "utf8");
  console.log("Patched HRM font alignment");
} else {
  console.log("already patched");
}

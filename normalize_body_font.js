const fs = require("fs");
const OUTLIERS = ["v2", "audit_compliance", "risk_management", "esg"];
const RULE = "body{font-size:13px!important;font-family:var(--fb)!important;}\n";
let done = 0;
for (const p of OUTLIERS) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) { console.log(p + " missing"); continue; }
  let html = fs.readFileSync(file, "utf8");
  // Skip if our forced rule is already there
  if (html.includes("body{font-size:13px!important;font-family:var(--fb)")) { console.log(p + " already patched"); continue; }
  fs.copyFileSync(file, file + ".bak.fontnorm." + Date.now());
  html = html.replace(/(<style id="__SP_PAGE_FIXES__">[\s\S]*?)(<\/style>)/, (m, body, close) => body + RULE + close);
  fs.writeFileSync(file, html, "utf8");
  done++;
  console.log(p + " normalized");
}
console.log("\nFixed: " + done + " files");

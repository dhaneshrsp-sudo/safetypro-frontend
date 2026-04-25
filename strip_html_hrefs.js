const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","risk_management","v2"];
const report = [];

for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) { report.push({p, a: "MISSING"}); continue; }
  fs.copyFileSync(file, file + ".bak.href." + Date.now());
  let html = fs.readFileSync(file, "utf8");

  // Strip .html from internal href="safetypro_X.html" — both single and double quotes
  const rx1 = /href="(safetypro_[a-z0-9_]+)\.html"/g;
  const rx2 = /href='(safetypro_[a-z0-9_]+)\.html'/g;
  const before1 = (html.match(rx1) || []).length;
  const before2 = (html.match(rx2) || []).length;
  html = html.replace(rx1, 'href="$1"').replace(rx2, "href='$1'");
  report.push({p, a: "stripped " + (before1 + before2) + " .html suffixes"});
  fs.writeFileSync(file, html, "utf8");
}

console.log("\n=== HREF SWEEP REPORT ===");
for (const r of report) console.log(r.p.padEnd(20), "->", r.a);

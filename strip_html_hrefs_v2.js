const fs = require("fs");
const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","risk_management","v2"];
let totalStripped = 0;
const report = [];
for (const p of LIVE_PAGES) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  fs.copyFileSync(file, file + ".bak.href2." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  let count = 0;
  // Handle href="...safetypro_X.html..." — with optional leading /, with optional query string
  html = html.replace(/href="(\/?safetypro_[a-z0-9_]+)\.html(\?[^"]*)?"/g, (m, path, query) => { count++; return `href="${path}${query||""}"`; });
  html = html.replace(/href='(\/?safetypro_[a-z0-9_]+)\.html(\?[^']*)?'/g, (m, path, query) => { count++; return `href='${path}${query||""}'`; });
  // Handle JS: location.replace('safetypro_X.html...'), location.href = '...', etc.
  html = html.replace(/(location\s*(?:\.href\s*=|\.assign\(|\.replace\(|=)\s*)(["'])(\/?safetypro_[a-z0-9_]+)\.html(\?[^"']*)?(["'])/g, (m, prefix, q1, path, query, q2) => { count++; return `${prefix}${q1}${path}${query||""}${q2}`; });
  fs.writeFileSync(file, html, "utf8");
  totalStripped += count;
  report.push(p.padEnd(18) + " stripped " + count);
}
console.log(report.join("\n"));
console.log("TOTAL: " + totalStripped + " stripped");

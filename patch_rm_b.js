const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");
let changes = 0;

// FIX B v2: no anchor - just plain text replace
const patterns = [
  [/Sustainability &amp; ESG 71384/g, "Sustainability &amp; ESG"],
  [/Sustainability & ESG 71384/g,    "Sustainability & ESG"]
];
for (const [rx, rep] of patterns) {
  const n = (html.match(rx)||[]).length;
  if (n) { html = html.replace(rx, rep); changes += n; console.log("Matched", rx.source, "->", n, "hits"); }
}

fs.writeFileSync(path, html, "utf8");
console.log("Total replacements:", changes);

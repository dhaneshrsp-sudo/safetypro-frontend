const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

// Loose regex: any attribute order
const openRx = /<div\b[^>]*?\bid="more-menu"[^>]*>/;
const m = openRx.exec(html);
if (!m) { console.error("#more-menu open tag not found"); process.exit(1); }
console.log("Open tag:", m[0]);

let i = m.index + m[0].length, depth = 1;
while (i < html.length && depth > 0) {
  const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
  if (c < 0) break;
  if (o >= 0 && o < c) { depth++; i = o + 4; }
  else { depth--; i = c + 6; }
}
const block = html.slice(m.index, i);
const mmRx = /<a[^>]*class="mm-item"[^>]*>[\s\S]*?<\/a>/g;
const anchors = block.match(mmRx) || [];
console.log("mm-items found:", anchors.length);
anchors.forEach((a, idx) => {
  const t = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
  console.log("  [" + idx + "]", t);
});
const rmIdx = anchors.findIndex(a => /safetypro_risk_management/.test(a));
if (rmIdx < 0) { console.log("No RM mm-item to remove"); process.exit(0); }
const rmAnchor = anchors[rmIdx];
const newBlock = block.replace(rmAnchor, "");
html = html.slice(0, m.index) + newBlock + html.slice(i);
fs.writeFileSync(path, html, "utf8");
console.log("Removed RM mm-item at index", rmIdx);

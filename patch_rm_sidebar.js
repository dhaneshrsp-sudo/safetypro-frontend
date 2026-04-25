const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

// Locate #sb-more-items block with balanced-div walker
const startMarker = "<div id=\"sb-more-items\">";
const startIdx = html.indexOf(startMarker);
if (startIdx < 0) { console.error("sb-more-items not found"); process.exit(1); }

let i = startIdx + startMarker.length, depth = 1;
while (i < html.length && depth > 0) {
  const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
  if (c < 0) { console.error("Unbalanced divs"); process.exit(1); }
  if (o >= 0 && o < c) { depth++; i = o + 4; }
  else { depth--; i = c + 6; }
}
const endIdx = i;
const inner = html.slice(startIdx + startMarker.length, endIdx - "</div>".length);
console.log("sb-more-items block:", (endIdx - startIdx), "bytes");

// Extract all sb-item anchors
const anchorRx = /<a[^>]*class="sb-item"[^>]*>[\s\S]*?<\/a>/g;
const anchors = inner.match(anchorRx) || [];
console.log("Anchors found:", anchors.length);
anchors.forEach((a, idx) => {
  const text = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
  console.log("  [" + idx + "]", text);
});

// Locate Risk Management anchor by text (exact match, not "Plan" etc.)
const rmIdx = anchors.findIndex(a => {
  const t = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return /^\s*Risk Management\s*$/.test(t) || /> ?Risk Management ?</.test(a);
});

if (rmIdx < 0) { console.error("RM anchor not found"); process.exit(1); }
if (rmIdx === 0) { console.log("Already at position 0"); process.exit(0); }

const rm = anchors[rmIdx];
const reordered = [rm, ...anchors.slice(0, rmIdx), ...anchors.slice(rmIdx + 1)];

// Rebuild: remove all anchor markup from inner, replace with reordered anchors
// preserving the original leading/trailing whitespace
let newInner = inner;
anchors.forEach(a => { newInner = newInner.replace(a, "\u0000PLACEHOLDER\u0000"); });
// Now squash placeholder sequences and insert reordered anchors
newInner = newInner.replace(/(\u0000PLACEHOLDER\u0000\s*)+/g, "__SPLIT__");
// Should be exactly one __SPLIT__ if anchors were contiguous
const splitCount = (newInner.match(/__SPLIT__/g) || []).length;
console.log("Placeholder groups:", splitCount);
if (splitCount !== 1) {
  console.error("Anchors not contiguous - aborting to avoid damage");
  process.exit(1);
}
newInner = newInner.replace("__SPLIT__", reordered.join("\n          "));

const newBlock = startMarker + newInner + "</div>";
html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);
fs.writeFileSync(path, html, "utf8");
console.log("Reordered: RM moved from " + rmIdx + " -> 0");

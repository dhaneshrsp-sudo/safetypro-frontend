const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

// Locate opening tag with regex (allow any attrs)
const openRx = /<div\s+id="sb-more-items"[^>]*>/;
const openMatch = html.match(openRx);
if (!openMatch) { console.error("sb-more-items opening tag not found"); process.exit(1); }
const startIdx = openMatch.index;
const afterStart = startIdx + openMatch[0].length;
console.log("Opening tag:", openMatch[0]);
console.log("Starts at:", startIdx);

// Walk balanced divs to find close
let i = afterStart, depth = 1;
while (i < html.length && depth > 0) {
  const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
  if (c < 0) { console.error("Unbalanced divs"); process.exit(1); }
  if (o >= 0 && o < c) { depth++; i = o + 4; }
  else { depth--; i = c + 6; }
}
const endIdx = i;
const inner = html.slice(afterStart, endIdx - "</div>".length);
console.log("Block size:", endIdx - startIdx, "bytes");

// Extract sb-item anchors
const anchorRx = /<a[^>]*class="sb-item"[^>]*>[\s\S]*?<\/a>/g;
const anchors = inner.match(anchorRx) || [];
console.log("Anchors in block:", anchors.length);
anchors.forEach((a, idx) => {
  const text = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
  console.log("  [" + idx + "]", text);
});

// Find Risk Management anchor
const rmIdx = anchors.findIndex(a => {
  const t = a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return /^Risk Management$/.test(t) || /> ?Risk Management ?</.test(a);
});
console.log("RM at position:", rmIdx);

if (rmIdx < 0) { console.error("RM anchor not found in sb-more-items"); process.exit(1); }
if (rmIdx === 0) { console.log("Already at position 0, no change"); process.exit(0); }

const rm = anchors[rmIdx];
const reordered = [rm, ...anchors.slice(0, rmIdx), ...anchors.slice(rmIdx + 1)];

// Placeholder-swap to preserve leading/trailing whitespace
let newInner = inner;
anchors.forEach(a => { newInner = newInner.replace(a, "\u0000PH\u0000"); });
newInner = newInner.replace(/(\u0000PH\u0000\s*)+/g, "__SPLIT__");
const splitCount = (newInner.match(/__SPLIT__/g) || []).length;
console.log("Placeholder groups:", splitCount);
if (splitCount !== 1) { console.error("Anchors not contiguous - aborting"); process.exit(1); }
newInner = newInner.replace("__SPLIT__", reordered.join("\n      "));

const newBlock = openMatch[0] + newInner + "</div>";
html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);
fs.writeFileSync(path, html, "utf8");
console.log("Reordered: RM moved " + rmIdx + " -> 0");

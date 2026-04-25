const fs = require("fs");
const SIMPLE = ["v2","operations","ai","auditor","documents","hrm","field"];
const report = [];

function locate(html) {
  const sbRx = /<(?:div|aside)\b[^>]*?\bclass="[^"]*\bsidebar\b[^"]*"[^>]*>/;
  const ctRx = /<div\b[^>]*?\bclass="[^"]*\bcontent\b[^"]*"[^>]*>/;
  const sbM = sbRx.exec(html);
  const ctM = ctRx.exec(html);
  if (!sbM || !ctM) return null;
  let i = sbM.index + sbM[0].length, depth = 1;
  while (i < html.length && depth > 0) {
    const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
    if (c < 0) return null;
    if (o >= 0 && o < c) { depth++; i = o + 4; } else { depth--; i = c + 6; }
  }
  return { sbEnd: i, ctStart: ctM.index };
}

for (const p of SIMPLE) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) { report.push({p, a: "MISSING"}); continue; }
  fs.copyFileSync(file, file + ".bak.struct." + Date.now());
  let html = fs.readFileSync(file, "utf8");
  const loc = locate(html);
  if (!loc) { report.push({p, a: "locate FAIL"}); continue; }
  const gap = html.slice(loc.sbEnd, loc.ctStart);
  // Safety: gap should be small (<100 bytes)
  if (gap.length > 100) { report.push({p, a: "SKIP gap too big: " + gap.length}); continue; }
  // Remove the first </div> + surrounding whitespace from the gap
  const gapFixed = gap.replace(/\s*<\/div>\s*/, "\n    ");
  // Verify we removed exactly one </div>
  const beforeCloses = (gap.match(/<\/div>/g)||[]).length;
  const afterCloses = (gapFixed.match(/<\/div>/g)||[]).length;
  if (beforeCloses - afterCloses !== 1) { report.push({p, a: "SKIP close count mismatch " + beforeCloses + "->" + afterCloses}); continue; }
  const newHtml = html.slice(0, loc.sbEnd) + gapFixed + html.slice(loc.ctStart);
  fs.writeFileSync(file, newHtml, "utf8");
  report.push({p, a: "fixed, gap: " + gap.length + "B -> " + gapFixed.length + "B"});
}

console.log("\n=== STRUCTURAL FIX REPORT ===");
for (const r of report) console.log(r.p.padEnd(14), "->", r.a);

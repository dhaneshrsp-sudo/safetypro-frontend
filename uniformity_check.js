const fs = require("fs");
const pages = ["v2","operations","control","reports","risk_management","audit_compliance","admin","field","hrm","ai","auditor","documents","esg"];
const out = [];
for (const p of pages) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  // body font-size (last match wins for override priority)
  const bodyMatches = [...html.matchAll(/body\s*\{[^}]*font-size\s*:\s*([^;}]+)/gi)].map(m => m[1].trim());
  const bodyFs = bodyMatches.length ? bodyMatches[bodyMatches.length-1] : "—";
  // body font-family
  const bodyFamMatch = html.match(/body\s*\{[^}]*font-family\s*:\s*([^;}]+)/i);
  const bodyFam = bodyFamMatch ? bodyFamMatch[1].trim() : "—";
  // google fonts
  const googleFontsMatch = html.match(/fonts\.googleapis\.com[^"']*/);
  const fontStack = googleFontsMatch ? googleFontsMatch[0].slice(0, 80) : "none";
  // font-size range
  const allSizes = [...html.matchAll(/font-size\s*:\s*(\d+)px/g)].map(m => +m[1]);
  const min = allSizes.length ? Math.min(...allSizes) : 0;
  const max = allSizes.length ? Math.max(...allSizes) : 0;
  out.push({ p: p.padEnd(18), bodyFs: bodyFs.padEnd(18), bodyFam: bodyFam.slice(0,14).padEnd(14), min, max, googleFontsSame: googleFontsMatch ? "Y" : "N" });
}
console.log("PAGE               | body font-size     | body font-fam  | minPx | maxPx | google");
console.log("-".repeat(92));
out.forEach(r => console.log(r.p + " | " + r.bodyFs + " | " + r.bodyFam + " | " + String(r.min).padEnd(5) + " | " + String(r.max).padEnd(5) + " | " + r.googleFontsSame));

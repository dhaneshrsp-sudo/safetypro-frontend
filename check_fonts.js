const fs = require("fs");
const cheerioFallback = (html) => html;

function extractFontInfo(file) {
  const html = fs.readFileSync(file, "utf8");
  // Find body font-family
  const bodyFont = html.match(/body\s*\{[^}]*font-family\s*:\s*([^;}]+)/i);
  // Find root / html font-size
  const rootSize = html.match(/(?:html|body|:root)\s*\{[^}]*font-size\s*:\s*([^;}]+)/i);
  // Find @import or <link rel="stylesheet" ... fonts.googleapis
  const googleFonts = [...html.matchAll(/(?:@import\s+url|href\s*=\s*["'])[^"']*fonts\.googleapis\.com[^"']+/g)].map(m => m[0].slice(0,200));
  // Find any font-family declarations (first 10)
  const fontFamilies = [...html.matchAll(/font-family\s*:\s*([^;}"']+)/g)].slice(0, 5).map(m => m[1].trim());
  // Find any font-size declarations (first 15)
  const fontSizes = [...html.matchAll(/font-size\s*:\s*([^;}"']+)/g)].slice(0, 15).map(m => m[1].trim());
  return {
    bodyFont: bodyFont ? bodyFont[1].trim() : "NOT FOUND",
    rootSize: rootSize ? rootSize[1].trim() : "NOT FOUND",
    googleFonts: googleFonts.slice(0,3),
    sampleFontFamilies: fontFamilies,
    sampleFontSizes: fontSizes
  };
}

const ops = extractFontInfo("safetypro_operations.html");
const hrm = extractFontInfo("safetypro_hrm.html");
const v2  = extractFontInfo("safetypro_v2.html");

console.log("=== OPERATIONS (REFERENCE) ===");
console.log(JSON.stringify(ops, null, 2));
console.log("\n=== V2 DASHBOARD ===");
console.log(JSON.stringify(v2, null, 2));
console.log("\n=== HRM ===");
console.log(JSON.stringify(hrm, null, 2));

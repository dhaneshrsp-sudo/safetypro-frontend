const fs = require("fs");
const html = fs.readFileSync("safetypro_hrm.html", "utf8");
// Extract all CSS rules with 8px, 18px, 28px and their selectors
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join("\n");

function findRulesWithSize(css, size) {
  const results = [];
  // naive: split on '}' and look for selectors with that font-size
  const blocks = css.split("}");
  for (const block of blocks) {
    const rx = new RegExp("font-size\\s*:\\s*" + size + "\\b");
    if (rx.test(block)) {
      const parts = block.split("{");
      if (parts.length === 2) {
        results.push({ selector: parts[0].trim().slice(0,120), rules: parts[1].trim().slice(0,150) });
      }
    }
  }
  return results;
}

console.log("=== HRM elements with 8px font ===");
findRulesWithSize(styleBlocks, "8px").forEach(r => console.log(" - " + r.selector + " { " + r.rules + " }"));
console.log("\n=== HRM elements with 28px font ===");
findRulesWithSize(styleBlocks, "28px").forEach(r => console.log(" - " + r.selector + " { " + r.rules + " }"));
console.log("\n=== HRM elements with 18px font ===");
findRulesWithSize(styleBlocks, "18px").forEach(r => console.log(" - " + r.selector + " { " + r.rules + " }"));

// Does hrm have any html/body/root font-size declaration at all?
const rootRules = [...styleBlocks.matchAll(/(?:html|body|:root)[^{]*\{[^}]*font-size[^}]*\}/g)].map(m => m[0].slice(0,200));
console.log("\n=== HRM root/html/body rules ===");
rootRules.forEach(r => console.log(" - " + r.replace(/\s+/g, " ")));

const fs = require("fs");
const path = "safetypro_reports.html";
let html = fs.readFileSync(path, "utf8");
let changes = [];

// FIX: close sub-header before div.main
// Search from position 70000 to avoid matching any earlier stray <div class="main">
const mainIdx = html.indexOf("<div class=\"main\">", 70000);
if (mainIdx < 0) { console.error("div.main anchor not found!"); process.exit(1); }
// Idempotency: only insert if not already preceded by a </div> within 40 chars
const pre = html.slice(Math.max(0, mainIdx-40), mainIdx);
if (pre.includes("__SUBHEADER_CLOSE__")) {
  console.log("Already patched, skipping close insertion");
} else {
  html = html.slice(0, mainIdx) + "</div><!-- __SUBHEADER_CLOSE__ close sub-header -->\n\n  " + html.slice(mainIdx);
  changes.push("closed sub-header before div.main at " + mainIdx);
}

// FIX: alert-list empty state
const oldAlert = "<div id=\"alert-list\"><div style=\"padding:14px;text-align:center;color:var(--t3);font-size:12px\">Loading...</div></div>";
const newAlert = "<div id=\"alert-list\"><div style=\"padding:14px;text-align:center;color:var(--t3);font-size:12px\">No new alerts</div></div>";
if (html.includes(oldAlert)) {
  html = html.replace(oldAlert, newAlert);
  changes.push("alert-list empty state updated");
} else if (html.includes("No new alerts")) {
  console.log("alert-list already patched");
} else {
  console.warn("alert-list pattern not matched — check manually");
}

fs.writeFileSync(path, html, "utf8");
console.log("Changes:", changes.length ? changes.join(" | ") : "NONE");

// Post-patch sanity
const opens = (html.match(/<div\b/g)||[]).length;
const closes = (html.match(/<\/div>/g)||[]).length;
console.log("New delta (opens - closes):", opens - closes, " (was -2, now expect -3)");

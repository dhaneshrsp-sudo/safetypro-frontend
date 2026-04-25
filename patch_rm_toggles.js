const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");
const changes = [];

// === 1) Strip malformed onclick from .sb-more-btn ===
// Handles escaped quotes inside the attribute
const sbBtnRx = /(<div\b[^>]*class="sb-more-btn"[^>]*?)\s+onclick="(?:[^"\\]|\\.)*"/;
if (sbBtnRx.test(html)) {
  html = html.replace(sbBtnRx, "$1");
  changes.push("stripped onclick from .sb-more-btn");
} else {
  console.log("(.sb-more-btn onclick not matched - already clean?)");
}

// === 2) Inject toggle functions before </body> ===
if (!html.includes("__SP_NAV_TOGGLES__")) {
  const block = [
    '<script id="__SP_NAV_TOGGLES__">',
    'function toggleMore(e){if(e){e.stopPropagation();}document.getElementById("more-btn").classList.toggle("open");}',
    'function toggleAlerts(){var d=document.getElementById("alerts-dropdown");if(d)d.style.display=d.style.display==="block"?"none":"block";}',
    'function toggleProfileMenu(){var d=document.getElementById("profile-dropdown");if(d)d.style.display=d.style.display==="block"?"none":"block";}',
    'function toggleSidebar(){var sb=document.querySelector(".sidebar");var ov=document.getElementById("sb-overlay");var btn=document.getElementById("sb-toggle");if(!sb)return;sb.classList.toggle("open");if(ov)ov.classList.toggle("show");if(btn)btn.classList.toggle("open");}',
    '</script>'
  ].join("\n");
  const bodyIdx = html.lastIndexOf("</body>");
  if (bodyIdx < 0) { console.error("No </body>"); process.exit(1); }
  html = html.slice(0, bodyIdx) + block + "\n" + html.slice(bodyIdx);
  changes.push("injected __SP_NAV_TOGGLES__");
} else {
  console.log("(toggles already present)");
}

fs.writeFileSync(path, html, "utf8");
console.log("Changes:", changes.length ? changes.join(" | ") : "NONE");

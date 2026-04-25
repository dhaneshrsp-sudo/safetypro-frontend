const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");
let changes = [];

// FIX B: strip corrupted digit suffix from sidebar Sustainability label
const before = html;
html = html.replace(/>Sustainability &amp; ESG 71384</g, ">Sustainability &amp; ESG<")
           .replace(/>Sustainability & ESG 71384</g, ">Sustainability & ESG<");
if (html !== before) changes.push("B: sidebar 71384 stripped");

// FIX A: inject hydration script before </body> if absent
if (!html.includes("__SP_NAV_HYDRATE__")) {
  const script = `
<script id="__SP_NAV_HYDRATE__">
(function(){
  try {
    var raw = localStorage.getItem("sp_user"); if(!raw) return;
    var u = JSON.parse(raw);
    var name = u.name || "User";
    var role = u.role === "ADMIN" ? "Admin" : (u.role || "User");
    var initials = name.split(/\\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase();
    var set = function(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; };
    set("nav-username", name);
    set("nav-role", role);
    set("nav-initials", initials);
    set("profile-name", name);
    set("profile-role-badge", role);
    set("pd-initials", initials);
  } catch(e) { console.warn("nav hydrate failed", e); }
})();
</script>
`;
  html = html.replace(/<\/body>/i, script + "</body>");
  changes.push("A: hydration script injected");
}

fs.writeFileSync(path, html, "utf8");
console.log("Changes:", changes.length ? changes.join(" | ") : "NONE");

const fs = require("fs");
const path = "safetypro_risk_management.html";
let html = fs.readFileSync(path, "utf8");

// STEP 1: Strip the broken injection (find script tag by id, remove it entirely)
// Uses a greedy match from our opening tag through its </script>
const badRx = /<script id="__SP_NAV_HYDRATE__">[\s\S]*?<\/script>/;
const hadBad = badRx.test(html);
if (hadBad) { html = html.replace(badRx, ""); console.log("Removed broken injection"); }

// STEP 2: Find the REAL end of document
// Use lastIndexOf on </body> — the real one is near the file end, any string-embedded
// ones are earlier in the file
const bodyIdx = html.lastIndexOf("</body>");
if (bodyIdx < 0) { console.error("No </body> found!"); process.exit(1); }

// Sanity check: must be within last 5000 bytes of file
if (html.length - bodyIdx > 5000) {
  console.warn("Warning: </body> is " + (html.length-bodyIdx) + " bytes from EOF. Check file structure.");
}

const script = [
  '<script id="__SP_NAV_HYDRATE__">',
  '(function(){',
  '  try {',
  '    var raw = localStorage.getItem("sp_user"); if(!raw) return;',
  '    var u = JSON.parse(raw);',
  '    var name = u.name || "User";',
  '    var role = u.role === "ADMIN" ? "Admin" : (u.role || "User");',
  '    var initials = name.split(/\\s+/).map(function(s){return s[0];}).slice(0,2).join("").toUpperCase();',
  '    var set = function(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; };',
  '    set("nav-username", name);',
  '    set("nav-role", role);',
  '    set("nav-initials", initials);',
  '    set("profile-name", name);',
  '    set("profile-role-badge", role);',
  '    set("pd-initials", initials);',
  '  } catch(e) { console.warn("nav hydrate failed", e); }',
  '})();',
  '</script>'
].join("\n");

html = html.slice(0, bodyIdx) + script + "\n" + html.slice(bodyIdx);
fs.writeFileSync(path, html, "utf8");
console.log("Injected hydration at real </body> index:", bodyIdx, "/ file size:", html.length);

const fs = require("fs");

const LIVE_PAGES = ["admin","ai","audit_compliance","auditor","control","documents","esg","field","hrm","operations","reports","v2"];
const PRIMARY = ["v2","v2_dash","operations","control","reports"];

const HYDRATE = [
  '<script id="__SP_NAV_HYDRATE__">',
  '(function(){',
  '  try {',
  '    var raw = localStorage.getItem("sp_user"); if(!raw) return;',
  '    var u = JSON.parse(raw);',
  '    var name = u.name || "User";',
  '    var role = u.role === "ADMIN" ? "Admin" : (u.role || "User");',
  '    var initials = name.split(/\\s+/).map(function(s){return s[0];}).slice(0,2).join("").toUpperCase();',
  '    var set = function(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; };',
  '    set("nav-username", name); set("nav-role", role); set("nav-initials", initials);',
  '    set("profile-name", name); set("profile-role-badge", role); set("pd-initials", initials);',
  '  } catch(e) { console.warn("nav hydrate failed", e); }',
  '})();',
  '</script>'
].join("\n");

const TOGGLES = [
  '<script id="__SP_NAV_TOGGLES__">',
  'function toggleMore(e){if(e){e.stopPropagation();}document.getElementById("more-btn").classList.toggle("open");}',
  'function toggleAlerts(){var d=document.getElementById("alerts-dropdown");if(d)d.style.display=d.style.display==="block"?"none":"block";}',
  'function toggleProfileMenu(){var d=document.getElementById("profile-dropdown");if(d)d.style.display=d.style.display==="block"?"none":"block";}',
  'function toggleSidebar(){var sb=document.querySelector(".sidebar");var ov=document.getElementById("sb-overlay");var btn=document.getElementById("sb-toggle");if(!sb)return;sb.classList.toggle("open");if(ov)ov.classList.toggle("show");if(btn)btn.classList.toggle("open");}',
  '</script>'
].join("\n");

const CSS_FIXES = [
  '<style id="__SP_PAGE_FIXES__">',
  '.content { overflow-y: auto !important; }',
  '.tab-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.ac-sub-panel { flex: 0 0 auto !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }',
  '.mt-filter-bar { flex-wrap: nowrap !important; overflow-x: auto !important; align-items: center !important; cursor: grab; scrollbar-width: none; -ms-overflow-style: none; }',
  '.mt-filter-bar::-webkit-scrollbar { display: none; }',
  '.mt-filter-bar.dragging { cursor: grabbing; user-select: none; }',
  '.mt-filter-bar > * { flex-shrink: 0; }',
  '.mt-filter-bar .mt-clear-btn { margin-left: auto !important; }',
  '</style>'
].join("\n");

const FILTER_DRAG = [
  '<script id="__SP_FILTER_DRAG__">',
  '(function(){',
  '  function init(){',
  '    var bar=document.querySelector(".mt-filter-bar"); if(!bar) return;',
  '    var isDown=false, startX=0, scrollLeft=0;',
  '    bar.addEventListener("mousedown",function(e){ if(e.target.closest("button, select, a, input, option")) return; isDown=true; bar.classList.add("dragging"); startX=e.pageX - bar.offsetLeft; scrollLeft=bar.scrollLeft; e.preventDefault(); });',
  '    var stop=function(){ isDown=false; bar.classList.remove("dragging"); };',
  '    bar.addEventListener("mouseleave", stop); bar.addEventListener("mouseup", stop);',
  '    bar.addEventListener("mousemove",function(e){ if(!isDown) return; e.preventDefault(); var x=e.pageX - bar.offsetLeft; bar.scrollLeft = scrollLeft - (x - startX); });',
  '    bar.addEventListener("wheel",function(e){ if(bar.scrollWidth > bar.clientWidth){ bar.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });',
  '  }',
  '  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();',
  '})();',
  '</script>'
].join("\n");

const report = [];
for (const pageKey of LIVE_PAGES) {
  const file = "safetypro_" + pageKey + ".html";
  if (!fs.existsSync(file)) { report.push({page: pageKey, changes: ["SKIP: file missing"]}); continue; }
  const ts = Date.now();
  fs.copyFileSync(file, file + ".bak.sweep." + ts);
  let html = fs.readFileSync(file, "utf8");
  const changes = [];

  // Inject HYDRATE before last </body>
  if (!html.includes("__SP_NAV_HYDRATE__")) {
    const idx = html.lastIndexOf("</body>");
    if (idx >= 0) { html = html.slice(0, idx) + HYDRATE + "\n" + html.slice(idx); changes.push("HYDRATE"); }
  }

  // Inject TOGGLES before last </body>
  if (!html.includes("__SP_NAV_TOGGLES__")) {
    const idx = html.lastIndexOf("</body>");
    if (idx >= 0) { html = html.slice(0, idx) + TOGGLES + "\n" + html.slice(idx); changes.push("TOGGLES"); }
  }

  // Inject CSS_FIXES before </head>
  if (!html.includes("__SP_PAGE_FIXES__")) {
    const idx = html.indexOf("</head>");
    if (idx >= 0) { html = html.slice(0, idx) + CSS_FIXES + "\n" + html.slice(idx); changes.push("CSS_FIXES"); }
  }

  // Inject FILTER_DRAG only if page has .mt-filter-bar
  if (!html.includes("__SP_FILTER_DRAG__") && /class="[^"]*mt-filter-bar/.test(html)) {
    const idx = html.lastIndexOf("</body>");
    if (idx >= 0) { html = html.slice(0, idx) + FILTER_DRAG + "\n" + html.slice(idx); changes.push("DRAG"); }
  }

  // Separator bug: unwrap <a> from 1px separator
  const sepRx = /(<div\s+style="height:1px;background:#1E293B;margin:10px 2px 6px">)\s*<a[^>]*class="sb-item"[^>]*>[\s\S]*?<\/a>\s*(<\/div>)/;
  if (sepRx.test(html)) { html = html.replace(sepRx, "$1$2"); changes.push("SEP_UNWRAP"); }

  // Current-page-hidden-from-MORE (secondary pages only)
  if (!PRIMARY.includes(pageKey)) {
    const pageHrefRx = new RegExp("safetypro_" + pageKey + "(\\.html)?\\b");
    const removeSelfFromMore = (divId, anchorClass) => {
      const openRx = new RegExp('<div\\b[^>]*?\\bid="' + divId + '"[^>]*>');
      const m = openRx.exec(html);
      if (!m) return;
      let i = m.index + m[0].length, depth = 1;
      while (i < html.length && depth > 0) {
        const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
        if (c < 0) return;
        if (o >= 0 && o < c) { depth++; i = o + 4; } else { depth--; i = c + 6; }
      }
      const block = html.slice(m.index, i);
      const anchorRx = new RegExp('<a[^>]*class="' + anchorClass + '"[^>]*>[\\s\\S]*?<\\/a>', "g");
      const anchors = block.match(anchorRx) || [];
      const self = anchors.find(a => pageHrefRx.test(a));
      if (self) {
        const newBlock = block.replace(self, "");
        html = html.slice(0, m.index) + newBlock + html.slice(i);
        changes.push("HIDE_SELF_" + divId);
      }
    };
    removeSelfFromMore("sb-more-items", "sb-item");
    removeSelfFromMore("more-menu", "mm-item");
  }

  if (changes.length > 0) fs.writeFileSync(file, html, "utf8");
  report.push({page: pageKey, changes, sizeKB: Math.round(html.length/1024)});
}

console.log("\n=== SWEEP REPORT ===");
console.log("Page                 | Size | Changes");
console.log("-".repeat(70));
for (const r of report) {
  console.log(r.page.padEnd(20), "|", String(r.sizeKB||"-").padEnd(4), "|", r.changes.length ? r.changes.join(", ") : "(none needed)");
}
console.log("\nBackups created with suffix .bak.sweep.<ts>");

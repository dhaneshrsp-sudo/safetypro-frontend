const fs = require("fs");
const FILES = fs.readdirSync(".")
  .filter(f => /^safetypro_.*\.html$/i.test(f) && !/(login|signup|auth|index)/i.test(f))
  .sort();

const secondaryPages = ["audit_compliance","risk_management","field","hrm","ai","auditor","documents","admin","esg"];
const primaryPages   = ["v2","v2_dash","operations","control","reports"];

function extractMoreItems(html, divId, anchorClass) {
  const openRx = new RegExp('<div\\b[^>]*?\\bid="' + divId + '"[^>]*>');
  const m = openRx.exec(html); if (!m) return null;
  let i = m.index + m[0].length, depth = 1;
  while (i < html.length && depth > 0) {
    const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
    if (c < 0) break;
    if (o >= 0 && o < c) { depth++; i = o + 4; } else { depth--; i = c + 6; }
  }
  const inner = html.slice(m.index + m[0].length, i - 6);
  const anchorRx = new RegExp('<a[^>]*class="' + anchorClass + '"[^>]*>[\\s\\S]*?<\\/a>', "g");
  const anchors = inner.match(anchorRx) || [];
  return anchors.map(a => {
    const hm = a.match(/href="([^"]+)"/);
    return hm ? hm[1].replace(/\.html$/, "").replace(/^.*safetypro_/, "") : "?";
  });
}

const rows = [];
for (const file of FILES) {
  const html = fs.readFileSync(file, "utf8");
  const pageKey = file.replace(/^safetypro_/, "").replace(/\.html$/, "");
  const sb = extractMoreItems(html, "sb-more-items", "sb-item");
  const tn = extractMoreItems(html, "more-menu",    "mm-item");
  rows.push({
    file,
    pageKey,
    size_kb: Math.round(html.length / 1024),
    H: html.includes("__SP_NAV_HYDRATE__") ? "Y" : "-",
    T: html.includes("__SP_NAV_TOGGLES__") ? "Y" : "-",
    C: html.includes("__SP_PAGE_FIXES__") ? "Y" : "-",
    D: html.includes("__SP_FILTER_DRAG__") ? "Y" : "-",
    sb_n: sb ? sb.length : "-",
    tn_n: tn ? tn.length : "-",
    self_in_sb: sb ? (sb.includes(pageKey) ? "BUG" : "ok") : "-",
    self_in_tn: tn ? (tn.includes(pageKey) ? "BUG" : "ok") : "-",
    sep_bug: /<div\s+style="height:1px;background:#1E293B;margin:10px 2px 6px">\s*<a[^>]*class="sb-item"/.test(html) ? "BUG" : "ok",
    has_footer: (/<footer\b|class="footer"/i.test(html)) ? "Y" : "-",
    has_filter_bar: /class="mt-filter-bar"/.test(html) || /class="rpt-filter-bar"/.test(html) || /id="rpt-filter-bar"/.test(html) ? "Y" : "-"
  });
}

// Print as compact table
const cols = ["file","size_kb","H","T","C","D","sb_n","tn_n","self_in_sb","self_in_tn","sep_bug","has_footer","has_filter_bar"];
const widths = cols.map(c => Math.max(c.length, ...rows.map(r => String(r[c]).length)));
const fmt = r => cols.map((c,i) => String(r[c]).padEnd(widths[i])).join(" | ");
console.log(cols.map((c,i) => c.padEnd(widths[i])).join(" | "));
console.log("-".repeat(widths.reduce((a,b)=>a+b+3,0)));
for (const r of rows) console.log(fmt(r));

console.log("\nLegend:");
console.log("  H/T/C/D = has __SP_NAV_HYDRATE__ / __SP_NAV_TOGGLES__ / __SP_PAGE_FIXES__ / __SP_FILTER_DRAG__");
console.log("  sb_n/tn_n = sidebar MORE count / top nav MORE count");
console.log("  self_in_sb/tn = BUG means current page is listed in its own MORE (should be hidden)");
console.log("  sep_bug = BUG means 1px separator wraps an <a> anchor");
console.log("  has_footer/has_filter_bar = presence");

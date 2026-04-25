const fs = require("fs");

// Shared helper: find #<id> div block, return {start, end, inner, wholeOpenTag}
function findDivById(html, id) {
  const openRx = new RegExp('<div\\s+id="' + id + '"[^>]*>');
  const m = openRx.exec(html);
  if (!m) return null;
  let i = m.index + m[0].length, depth = 1;
  while (i < html.length && depth > 0) {
    const o = html.indexOf("<div", i), c = html.indexOf("</div>", i);
    if (c < 0) break;
    if (o >= 0 && o < c) { depth++; i = o + 4; }
    else { depth--; i = c + 6; }
  }
  return { start: m.index, end: i, openTag: m[0], block: html.slice(m.index, i) };
}

const anchorRx = /<a[^>]*class="sb-item"[^>]*>[\s\S]*?<\/a>/g;
const mmRx = /<a[^>]*class="mm-item"[^>]*>[\s\S]*?<\/a>/g;

// === STEP 1: Pull Audit sb-item template from reports.html ===
const ref = fs.readFileSync("safetypro_reports.html", "utf8");
const refSb = findDivById(ref, "sb-more-items");
if (!refSb) { console.error("reports.html: sb-more-items not found"); process.exit(1); }
const refAnchors = refSb.block.match(anchorRx) || [];
const auditSb = refAnchors.find(a => /safetypro_audit_compliance/.test(a));
if (!auditSb) { console.error("reports.html: audit sb-item not found"); process.exit(1); }
console.log("Audit sb-item template:", auditSb.length, "bytes");

// === STEP 2: Load target file ===
const target = "safetypro_risk_management.html";
let html = fs.readFileSync(target, "utf8");

// === STEP 3: Fix sidebar MORE — replace RM with Audit ===
const sb = findDivById(html, "sb-more-items");
if (!sb) { console.error("target: sb-more-items not found"); process.exit(1); }
const sbAnchors = sb.block.match(anchorRx) || [];
const hasAudit = sbAnchors.some(a => /safetypro_audit_compliance/.test(a));
const rmSb = sbAnchors.find(a => /safetypro_risk_management/.test(a));

if (hasAudit && !rmSb) {
  console.log("Sidebar MORE already correct (has Audit, no RM)");
} else if (rmSb && !hasAudit) {
  const newBlock = sb.block.replace(rmSb, auditSb);
  html = html.slice(0, sb.start) + newBlock + html.slice(sb.end);
  console.log("Sidebar: RM -> Audit (replaced)");
} else if (rmSb && hasAudit) {
  // Edge: both present, remove RM only
  const newBlock = sb.block.replace(rmSb, "");
  html = html.slice(0, sb.start) + newBlock + html.slice(sb.end);
  console.log("Sidebar: both present, removed RM");
} else {
  console.log("Sidebar: neither RM nor Audit found — manual check needed");
}

// === STEP 4: Fix top nav MORE — remove RM mm-item (Audit already there) ===
const tm = findDivById(html, "more-menu");
if (!tm) {
  console.log("Top nav more-menu not found");
} else {
  const mm = tm.block.match(mmRx) || [];
  const rmMm = mm.find(a => /safetypro_risk_management/.test(a));
  if (!rmMm) {
    console.log("Top nav MORE: no RM mm-item (already clean)");
  } else {
    const newBlock = tm.block.replace(rmMm, "");
    html = html.slice(0, tm.start) + newBlock + html.slice(tm.end);
    console.log("Top nav MORE: removed RM mm-item");
  }
}

fs.writeFileSync(target, html, "utf8");
console.log("Done, file size:", html.length);

const fs = require("fs");
const OUTLIERS = ["audit_compliance", "risk_management", "esg"];
const FORCE_STYLE = '<style id="__SP_BODY_FONT_FORCE__">body{font-size:13px!important;font-family:var(--fb,"Roboto",system-ui,sans-serif)!important;}</style>';
for (const p of OUTLIERS) {
  const file = "safetypro_" + p + ".html";
  if (!fs.existsSync(file)) { console.log(p + " missing"); continue; }
  let html = fs.readFileSync(file, "utf8");
  // Strip any prior force-block (idempotent)
  html = html.replace(/<style id="__SP_BODY_FONT_FORCE__">[\s\S]*?<\/style>\s*/g, "");
  // Insert at the VERY END before last </body>
  const lastBody = html.lastIndexOf("</body>");
  if (lastBody === -1) { console.log(p + " no </body>"); continue; }
  html = html.slice(0, lastBody) + FORCE_STYLE + "\n" + html.slice(lastBody);
  fs.writeFileSync(file, html, "utf8");
  console.log(p + " force-style injected at end of body");
}

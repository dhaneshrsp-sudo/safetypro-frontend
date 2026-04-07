const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_field.html');
let html = fs.readFileSync(fp, 'utf8');
fs.copyFileSync(fp, fp.replace('.html','_bk_'+Date.now()+'.html'));

// Remove any old footer line fix block
var s = html.indexOf('<style>/* sp-footer-line-fix */');
if(s>=0){var e=html.indexOf('</style>',s)+8; html=html.slice(0,s)+html.slice(e); console.log('Removed old block');}

// THE FIX:
// Sidebar bg = #0F1720, Footer bg = #0F1720 (same!) 
// So border-top #1E293B is invisible between identical colours.
// Solution: use a brighter/lighter border colour that contrasts against #0F1720
const FIX = `<style>/* sp-footer-line-fix */
footer.sp-footer, .sp-footer {
  border-top: 1px solid #334155 !important;
}
</style>
`;

var hi = html.indexOf('</head>');
html = html.slice(0, hi) + FIX + html.slice(hi);
fs.writeFileSync(fp, html, 'utf8');
console.log('Done → npx wrangler pages deploy . --project-name safetypro-frontend');

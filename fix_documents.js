/**
 * SafetyPro AI — fix_documents.js
 * Documents & Records — adds KPI card gap + padding
 * Run: cd C:\safetypro_complete_frontend && node fix_documents.js
 */
const fs = require('fs'), path = require('path');
const fp = path.join(process.cwd(), 'safetypro_documents.html');
if (!fs.existsSync(fp)) { console.error('NOT FOUND'); process.exit(1); }
let html = fs.readFileSync(fp, 'utf8');
const bk = fp.replace('.html','_bk_docs3_'+Date.now()+'.html');
fs.copyFileSync(fp, bk);

// Remove old sp-docs-fix
var s = html.indexOf('<style>\n/* sp-docs-fix */');
if(s<0) s=html.indexOf('<style>/* sp-docs-fix */');
if(s>=0){var e=html.indexOf('</style>',s);if(e>=0)html=html.slice(0,s)+html.slice(e+8);}

const FIX = `<style>
/* sp-docs-fix */
html{height:100%;overflow:hidden;}
body{height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.topnav{flex-shrink:0!important;height:52px!important;}
.body{flex:1 1 0%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:row!important;margin-top:0!important;}
.sidebar{position:relative!important;flex-shrink:0!important;height:100%!important;overflow-y:auto!important;scrollbar-width:none!important;}
.sidebar::-webkit-scrollbar{display:none!important;}
.content{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:var(--border,#1E293B) transparent;}
.content::-webkit-scrollbar{width:4px!important;}
.content::-webkit-scrollbar-thumb{background:var(--border,#1E293B)!important;border-radius:2px!important;}
.sub-header{position:sticky!important;top:0!important;z-index:10!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;flex-wrap:nowrap!important;width:calc(100% + 4px)!important;margin-right:-4px!important;box-sizing:border-box!important;}
/* Gap: 16px below sub-header, 20px side padding for KPI cards */
.content>div:nth-child(2){margin-top:16px!important;padding:0 20px!important;}
/* KPI cards: stretch to fill full width */
.content div[style*="auto-fill"]{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))!important;}
footer.sp-footer,.sp-footer{flex-shrink:0!important;display:flex!important;}
</style>
`;
var hi=html.indexOf('</head>');
html=html.slice(0,hi)+FIX+html.slice(hi);
fs.writeFileSync(fp,html,'utf8');
console.log('Fixed:',Math.round(html.length/1024)+'KB');
console.log('\nDeploy: npx wrangler pages deploy . --project-name safetypro-frontend');

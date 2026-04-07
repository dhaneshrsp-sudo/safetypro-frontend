const fs = require('fs');
const FIX = `<style>
/* auditor-scroll-fix */
.content{overflow:hidden!important;display:flex!important;flex-direction:column!important;}
.content > div:not(.sub-header){flex:1!important;overflow-y:scroll!important;min-height:0!important;scrollbar-width:thin!important;scrollbar-color:#475569 #1E293B!important;}
.content > div:not(.sub-header)::-webkit-scrollbar{width:6px!important;display:block!important;}
.content > div:not(.sub-header)::-webkit-scrollbar-track{background:#1E293B!important;}
.content > div:not(.sub-header)::-webkit-scrollbar-thumb{background:#475569!important;border-radius:3px!important;}
</style>`;

let h = fs.readFileSync('safetypro_auditor.html','utf8');
if(h.includes('auditor-scroll-fix')){console.log('SKIP');process.exit();}
h = h.replace('</body>', FIX + '\n</body>');
fs.writeFileSync('safetypro_auditor.html', h, 'utf8');
console.log('PATCHED');

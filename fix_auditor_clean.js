const fs = require('fs');

let h = fs.readFileSync('safetypro_auditor.html', 'utf8');
console.log('Before:', Math.round(h.length/1024)+'KB');

// Step 1: Strip ALL previous patch blocks (style and script)
const patchMarkers = [
  'auditor-content-scroll-v2',
  'auditor-wrap-direct-fix', 
  'auditor-gap-scroll-fix',
  'content-gap-fix',
  'content-scroll-gap-fix',
  'content-padding-fix',
  'sidebar-height-fix',
  'sidebar-gap-final',
  'ai-tab-scroll-fix',
  'ai-scrollbar-visible-fix',
  'ai-all-tabs-scroll',
  'ai-native-scrollbar',
  'ai-always-scrollbar',
  'ai-tab-minheight-fix',
  'ai-patterns-padding',
  'sidebar-gap-final'
];

// Remove <style>...</style> blocks containing patch markers
patchMarkers.forEach(marker => {
  // Remove style blocks
  const styleRe = new RegExp('<style>[^<]*' + marker + '[\\s\\S]*?<\\/style>\\s*', 'g');
  h = h.replace(styleRe, '');
  // Remove script blocks  
  const scriptRe = new RegExp('<script>[^<]*\\/\\*\\s*' + marker + '[\\s\\S]*?<\\/script>\\s*', 'g');
  h = h.replace(scriptRe, '');
});

// Also remove the sp-scroll-wrap JS injection script
h = h.replace(/<script>\s*\/\* auditor-scroll-wrapper \*\/[\s\S]*?<\/script>\s*/g, '');

console.log('After strip:', Math.round(h.length/1024)+'KB');

// Step 2: Find <!-- CONTENT --> and get the main content div
const contentIdx = h.indexOf('<!-- CONTENT -->');
if (contentIdx === -1) { console.log('ERROR: <!-- CONTENT --> not found'); process.exit(1); }

// Find the .content div opening
const contentDivIdx = h.indexOf('<div class="content">', contentIdx);
if (contentDivIdx === -1) { console.log('ERROR: .content div not found'); process.exit(1); }

// Find the sub-header closing tag
const subHeaderStart = h.indexOf('<div class="sub-header">', contentDivIdx);
const subHeaderEnd = h.indexOf('</div>', h.indexOf('</div>', subHeaderStart) + 6) + 6;

console.log('sub-header ends at:', subHeaderEnd);
console.log('Context:', h.substring(subHeaderEnd, subHeaderEnd + 60));

// Find where content div ends (just before </div> that closes .content, then footer, then </div> body)
// Find the sp-footer start as the end boundary
const footerIdx = h.indexOf('<footer', contentDivIdx);
const contentDivEnd = footerIdx > -1 ? footerIdx : h.indexOf('</div>', h.lastIndexOf('<div class="content">') + 100);

// Step 3: Extract everything between sub-header end and content div end
const innerContent = h.substring(subHeaderEnd, contentDivEnd);
console.log('Inner content length:', innerContent.length);

// Step 4: Replace with wrapped version
const WRAPPED = `\n    <div style="flex:1;overflow-y:scroll;min-height:0;padding:16px;scrollbar-width:thin;scrollbar-color:#475569 #1E293B;">\n` + innerContent + `    </div>\n`;

h = h.substring(0, subHeaderEnd) + WRAPPED + h.substring(contentDivEnd);

// Step 5: Fix .content to be flex column
const STYLE_FIX = `<style>
/* auditor-final-fix */
.content{display:flex!important;flex-direction:column!important;overflow:hidden!important;height:100%!important;}
.content .sub-header{flex-shrink:0!important;}
.content > div:nth-child(2)::-webkit-scrollbar{width:6px!important;display:block!important;}
.content > div:nth-child(2)::-webkit-scrollbar-track{background:#1E293B!important;}
.content > div:nth-child(2)::-webkit-scrollbar-thumb{background:#475569!important;border-radius:3px!important;}
</style>`;

h = h.replace('</head>', STYLE_FIX + '\n</head>');

fs.writeFileSync('safetypro_auditor.html', h, 'utf8');
console.log('DONE:', Math.round(h.length/1024)+'KB');
console.log('Has auditor-final-fix:', h.includes('auditor-final-fix'));

/**
 * fix_subtabs.js
 * 1. Removes wrongly-inserted <button class="subtab-btn"> for CAPA/Sign-off/AI Insights
 * 2. Inserts correct <div class="ac-sub-tab"> elements at end of IMS sub-tab bar
 * 3. Hides #ims-analytics-v2-add by default (show only when Analytics active)
 * Run from HTML folder: node fix_subtabs.js
 */
const fs = require('fs');
const FILE = 'safetypro_audit_compliance.html';
if (!fs.existsSync(FILE)) { console.log('File not found'); process.exit(1); }
let html = fs.readFileSync(FILE, 'utf8');
const orig = html;

// ── 1. Remove wrongly placed subtab-btn buttons ─────────────────────────────
const WRONG_BTNS = [
  `ims','capa'`,
  `ims','signoff'`,
  `ims','ai-insights'`,
  // Handle both quote styles
  `ims","capa"`,
  `ims","signoff"`,
  `ims","ai-insights"`,
];

let removedCount = 0;
for (const marker of WRONG_BTNS) {
  const idx = html.indexOf(marker);
  if (idx === -1) continue;
  // Find the enclosing <button tag
  const btnStart = html.lastIndexOf('<button', idx);
  if (btnStart === -1) continue;
  const btnEnd = html.indexOf('</button>', idx);
  if (btnEnd === -1) continue;
  const fullBtn = html.slice(btnStart, btnEnd + 9);
  if (fullBtn.includes('subtab-btn') || fullBtn.includes('ac-sub-tab')) {
    html = html.replace(fullBtn, '');
    removedCount++;
    console.log(`✅ Removed wrong button for: ${marker}`);
  }
}

// ── 2. Insert correct ac-sub-tab divs after the Analytics IMS tab ────────────
// The Analytics IMS tab has: acSubTab(this,'ims','analytics')
// We need to insert after its closing tag in the ac-sub-tabs container

const NEW_DIVS = [
  `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','capa');imsShowNewTab('ims-capa');imsHideChecklistFilter()">🔄 CAPA</div>`,
  `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','signoff');imsShowNewTab('ims-signoff');imsHideChecklistFilter()">✒️ Sign-off</div>`,
  `<div class="ac-sub-tab" onclick="acSubTab(this,'ims','ai-insights');imsShowNewTab('ims-ai-insights');imsHideChecklistFilter()">🤖 AI Insights</div>`,
];

// Check if already inserted correctly
const alreadyCorrect = html.includes(`onclick="acSubTab(this,'ims','capa')`) && 
  html.indexOf(`onclick="acSubTab(this,'ims','capa')`) < html.indexOf('class="subtab-btn"') + 1000;

if (!alreadyCorrect || html.includes(`onclick="acSubTab(this,'ims','capa')`)) {
  // Only add if not already present as ac-sub-tab
  const hasCorrectCapa = html.includes(`class="ac-sub-tab" onclick="acSubTab(this,'ims','capa')`);
  if (!hasCorrectCapa) {
    // Find the IMS analytics ac-sub-tab and insert after its closing </div>
    const analyticsMarker = `acSubTab(this,'ims','analytics')`;
    const analyticsIdx = html.indexOf(analyticsMarker);
    if (analyticsIdx !== -1) {
      // Find closing </div> of this ac-sub-tab
      const divClose = html.indexOf('</div>', analyticsIdx);
      if (divClose !== -1) {
        const insertAt = divClose + 6; // after </div>
        html = html.slice(0, insertAt) + '\n      ' + NEW_DIVS.join('\n      ') + html.slice(insertAt);
        console.log('✅ Correct ac-sub-tab divs inserted after Analytics tab');
      }
    }
  } else {
    console.log('ℹ️  Correct ac-sub-tab divs already present');
  }
}

// ── 3. Hide ims-analytics-v2-add by default ──────────────────────────────────
// Replace id="ims-analytics-v2-add" with id="ims-analytics-v2-add" style="display:none"
if (html.includes('id="ims-analytics-v2-add"') && !html.includes('id="ims-analytics-v2-add" style="display:none"')) {
  html = html.replace(
    'id="ims-analytics-v2-add"',
    'id="ims-analytics-v2-add" style="display:none"'
  );
  console.log('✅ ims-analytics-v2-add hidden by default');
}

// ── 4. Update Analytics tab onclick to also show the v2 add-on ───────────────
// Find the IMS analytics ac-sub-tab and add show of v2 add-on
const analyticsOnclick = `acSubTab(this,'ims','analytics');imsRenderAnalytics();imsHideChecklistFilter()`;
if (html.includes(analyticsOnclick)) {
  html = html.replace(
    analyticsOnclick,
    `acSubTab(this,'ims','analytics');imsRenderAnalytics();imsHideChecklistFilter();document.getElementById('ims-analytics-v2-add').style.display='block'`
  );
  console.log('✅ Analytics onclick updated to show v2 add-on');
}

// ── 5. Update imsShowNewTab to also hide the v2 add-on ───────────────────────
// The function already handles hiding ims-analytics; add hiding the v2 add-on
if (html.includes("function imsShowNewTab(tabId)")) {
  const oldFn = "function imsShowNewTab(tabId){";
  const newStart = `function imsShowNewTab(tabId){
  var av2=document.getElementById('ims-analytics-v2-add');
  if(av2)av2.style.display='none';`;
  html = html.replace(oldFn, newStart);
  console.log('✅ imsShowNewTab updated to hide v2 add-on on tab switch');
}

// ── Write ────────────────────────────────────────────────────────────────────
if (html !== orig) {
  fs.writeFileSync(FILE, html, 'utf8');
  console.log(`\n✅ File saved. Size: ${(html.length/1024).toFixed(0)}KB`);
  console.log(`   Removed ${removedCount} wrong button(s)`);
} else {
  console.log('\nℹ️  No changes made');
}
console.log('\nDeploy: npx wrangler pages deploy . --project-name=safetypro-frontend');

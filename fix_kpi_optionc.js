const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find the incident KPI row and replace with Option C layout
// Primary row: Total, Fatalities, LTI, MTC (4 large cards)
// Secondary row: Near Misses, Open Investigations, LTIFR, Severity Rate (4 smaller cards)

const oldRow = '<div class="ac-kpi-row" style="flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;">';
const newRow = `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
<!-- PRIMARY ROW: 4 large cards -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">`;

// Also find the closing of the row and split into two
// Primary cards: ik-total, ik-fatal, ik-lti, ik-mtc
// Secondary cards: ik-nearmiss, ik-open, ik-ltifr, ik-ltisr

// Replace the entire kpi-row block
const rowStart = content.indexOf('<div class="ac-kpi-row" style="flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;">');
const rowEnd = content.indexOf('</div>', rowStart) + 6;

// Extract card lines
const rowContent = content.slice(rowStart, rowEnd);
const lines = rowContent.split('\n').filter(l => l.trim().startsWith('<div class="ac-kpi"'));

// Separate primary and secondary
const primary = lines.filter(l => /ik-total|ik-fatal|ik-lti"|ik-mtc/.test(l));
const secondary = lines.filter(l => /ik-nearmiss|ik-open|ik-ltifr|ik-ltisr/.test(l));

console.log('Primary cards:', primary.length);
console.log('Secondary cards:', secondary.length);

const newBlock = `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
<!-- PRIMARY ROW: Core incident metrics — larger -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
${primary.join('\n')}
</div>
<!-- SECONDARY ROW: Rate metrics — compact -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
${secondary.map(card => {
  // Make secondary cards more compact
  return card.replace('class="ac-kpi"', 'class="ac-kpi" style="padding:8px 10px;min-height:0;"')
             .replace(/font-size:\d+px/g, 'font-size:18px')
             .replace(/<div class="ac-kpi-val"/g, '<div class="ac-kpi-val" style="font-size:20px!important;"');
}).join('\n')}
</div>
</div>`;

content = content.slice(0, rowStart) + newBlock + content.slice(rowEnd);
console.log('✅ Option C layout applied');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

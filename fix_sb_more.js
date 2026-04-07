const fs = require('fs');
const path = require('path');
const DIR = process.cwd();

// The correct sb-more-btn HTML (from safetypro_operations.html)
const NEW_BTN = `<div class="sb-more-btn" onclick="var i=document.getElementById('sb-more-items');var a=document.getElementById('sb-more-arr');var o=i.style.display==='block';i.style.display=o?'none':'block';a.style.transform=o?'':'rotate(180deg)';" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;margin:2px 8px;border-radius:8px;cursor:pointer;color:var(--t2);font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;transition:.2s" onmouseover="this.style.background='var(--raised)'" onmouseout="this.style.background='transparent'">
      <span>More</span>
      <svg id="sb-more-arr" viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
    </div>`;

// Pages with static plain label: <div style="font-size:9px...">More</div>
const STATIC_PAGES = [
  'safetypro_documents.html',
  'safetypro_ai.html',
  'safetypro_auditor.html'
];

// Pages with sb-more-hdr + toggleSidebarMore
const HDR_PAGES = [
  'safetypro_hrm.html',
  'safetypro_field.html'
];

let patched = 0;

// --- Fix STATIC pages ---
STATIC_PAGES.forEach(filename => {
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }
  let html = fs.readFileSync(fp, 'utf8');

  // Find the static More label
  const OLD = 'font-size:9px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.8px;padding:2px 10px 6px">More</div>';
  const idx = html.indexOf(OLD);
  if (idx === -1) {
    console.log('SKIP (pattern not found):', filename);
    return;
  }

  // Find start of the opening div tag before this
  const divStart = html.lastIndexOf('<div', idx);
  const divEnd = idx + OLD.length;
  const oldLabel = html.substring(divStart, divEnd);

  html = html.substring(0, divStart) + NEW_BTN + html.substring(divEnd);

  // Ensure sb-more-items is visible (not display:none initially — open by default)
  // Actually keep display:none so toggle works; it will open on click.

  fs.writeFileSync(fp, html, 'utf8');
  console.log('PATCHED:', filename,
    '| sb-more-btn:', html.includes('sb-more-btn'),
    '| sb-more-items:', html.includes('sb-more-items'),
    '| size:', Math.round(html.length/1024) + 'KB'
  );
  patched++;
});

// --- Fix HDR pages ---
HDR_PAGES.forEach(filename => {
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) { console.log('NOT FOUND:', filename); return; }
  let html = fs.readFileSync(fp, 'utf8');

  // Find sb-more-hdr div
  const HDR_START = '<div id="sb-more-hdr"';
  const idx = html.indexOf(HDR_START);
  if (idx === -1) {
    console.log('SKIP (sb-more-hdr not found):', filename);
    return;
  }

  // Find end of this div tag (closing >)
  const tagEnd = html.indexOf('>', idx) + 1;
  // Now find the closing </div> for this element
  const divClose = html.indexOf('</div>', tagEnd) + 6;

  const oldHdr = html.substring(idx, divClose);
  console.log('  Replacing in', filename, ':', oldHdr.substring(0, 80) + '...');

  html = html.substring(0, idx) + NEW_BTN + html.substring(divClose);

  fs.writeFileSync(fp, html, 'utf8');
  console.log('PATCHED:', filename,
    '| sb-more-btn:', html.includes('sb-more-btn'),
    '| sb-more-items:', html.includes('sb-more-items'),
    '| size:', Math.round(html.length/1024) + 'KB'
  );
  patched++;
});

console.log('\nTotal patched:', patched, '/ 5');
console.log('\nNow deploy:');
console.log('  npx wrangler pages deploy . --project-name safetypro-frontend');

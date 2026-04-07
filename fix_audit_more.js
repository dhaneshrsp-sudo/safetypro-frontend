const fs = require('fs');

const CORRECT_BLOCK = `<div class="sb-more-btn" onclick="var i=document.getElementById('sb-more-items');var a=document.getElementById('sb-more-arr');var o=i.style.display==='block';i.style.display=o?'none':'block';a.style.transform=o?'':'rotate(180deg)';" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;margin:2px 8px;border-radius:8px;cursor:pointer;color:var(--t2);font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;transition:.2s" onmouseover="this.style.background='var(--raised)'" onmouseout="this.style.background='transparent'">
      <span>More</span>
      <svg id="sb-more-arr" viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div id="sb-more-items" style="display:block">
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_field.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        Site &amp; Field Tools
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px;color:#8B5CF6" href="safetypro_hrm.html"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:#8B5CF6"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>HRM &amp; Payroll</a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_ai.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        AI Intelligence
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_auditor.html">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Client &amp; Auditor Portal
      </a>
      <a class="sb-item" style="font-size:12px;padding:7px 10px" href="safetypro_documents.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        Documents &amp; Records
      </a>
      <div style="height:1px;background:var(--border);margin:6px 8px"></div>
      <a class="sb-item" style="font-size:12px;padding:7px 10px;color:var(--green)" href="safetypro_admin.html">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--green)"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Admin &amp; Configuration
      </a>
    </div>`;

let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// Find static label div start
const OLD_LABEL = 'font-size:9px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.8px;padding:2px 10px 6px">More</div>';
const labelIdx = h.indexOf(OLD_LABEL);
const divStart = h.lastIndexOf('<div', labelIdx);
const labelEnd = labelIdx + OLD_LABEL.length;

// Find end of last sb-item after label
let lastItemEnd = labelEnd;
let idx = labelEnd;
while((idx = h.indexOf('<a class="sb-item"', idx+1)) !== -1 && idx < labelEnd+4000) {
  lastItemEnd = h.indexOf('</a>', idx) + 4;
}

console.log('divStart:', divStart, 'lastItemEnd:', lastItemEnd);
h = h.substring(0, divStart) + CORRECT_BLOCK + h.substring(lastItemEnd);

fs.writeFileSync('safetypro_audit_compliance.html', h, 'utf8');
console.log('PATCHED | sb-more-btn:', h.includes('sb-more-btn'), '| sb-more-items:', h.includes('sb-more-items'));
console.log('Size:', Math.round(h.length/1024)+'KB');

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Replace imsApRefresh with one that reads from the page's audit data
const oldFn = content.indexOf('function imsApRefresh()');
const oldEnd = content.indexOf('\n}', oldFn) + 2;

const newRefresh = `function imsApRefresh() {
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel) return;
  // Read audit data from page variable or fallback to known list
  var audits = [];
  // Try window.IMS_PLAN_DATA or similar
  if (window.IMS_PLAN_DATA && window.IMS_PLAN_DATA.length) {
    audits = window.IMS_PLAN_DATA;
  } else {
    // Read from rendered table rows
    var tbody = document.getElementById('ims-calendar-tbody') || document.querySelector('#ims-planning table tbody');
    if (tbody) {
      Array.from(tbody.querySelectorAll('tr')).forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (cells.length > 1) {
          var no = cells[0] ? cells[0].textContent.trim() : '';
          var dept = cells[1] ? cells[1].textContent.trim() : '';
          var type = cells[2] ? cells[2].textContent.trim() : '';
          if (no && no.match(/IMS-\\d+/)) audits.push({no:no, dept:dept, type:type});
        }
      });
    }
    // Fallback to hardcoded list
    if (!audits.length) {
      ['IMS-001','IMS-002','IMS-003','IMS-004','IMS-005','IMS-006','IMS-007','IMS-008'].forEach(function(id) {
        audits.push({no:id});
      });
    }
  }
  sel.innerHTML = '<option value="">Select Audit...</option>';
  audits.forEach(function(a) {
    var opt = document.createElement('option');
    var no = a.no || a.id || a.auditNo || '';
    var label = no;
    if (a.dept) label += ' — ' + a.dept;
    if (a.type) label += ' (' + a.type + ')';
    opt.value = no;
    opt.textContent = label;
    sel.appendChild(opt);
  });
  imsApRenderUI();
}`;

if (oldFn > -1) {
  content = content.slice(0, oldFn) + newRefresh + content.slice(oldEnd);
  console.log('✅ imsApRefresh updated');
} else {
  console.log('❌ function not found');
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

const oldRefresh = `function imsApRefresh() {
  // Populate audit selector from IMS_DATA
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel) return;
  var audits = window.IMS_DATA || [];
  sel.innerHTML = '<option value="">Select Audit...</option>';
  audits.forEach(function(a) {
    var opt = document.createElement('option');
    opt.value = a.id || a.auditNo || '';
    opt.textContent = (a.id || a.auditNo || '?') + ' — ' + (a.title || a.type || 'Audit') + ' (' + (a.site || a.project || '') + ')';
    sel.appendChild(opt);
  });
  if (audits.length === 0) {
    var opt = document.createElement('option');
    opt.value = 'IMS-001'; opt.textContent = 'IMS-001 — Internal HSE Audit';
    sel.appendChild(opt);
  }
  imsApRenderUI();
}`;

const newRefresh = `function imsApRefresh() {
  var sel = document.getElementById('ims-ap-audit-sel');
  if (!sel) return;
  var audits = window.IMS_DATA || window.imsData || [];
  if (!audits.length) {
    var rows = document.querySelectorAll('#ims-calendar-tbody tr, #ims-planning-tbody tr');
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length > 1) {
        var id = cells[0] ? cells[0].textContent.trim() : '';
        var dept = cells[1] ? cells[1].textContent.trim() : '';
        var type = cells[2] ? cells[2].textContent.trim() : '';
        if (id) audits.push({id: id, dept: dept, type: type});
      }
    });
  }
  sel.innerHTML = '<option value="">Select Audit...</option>';
  if (audits.length) {
    audits.forEach(function(a) {
      var opt = document.createElement('option');
      var id = a.id || a.auditNo || a.no || '';
      var label = id + ' — ' + (a.title || a.type || a.dept || 'Audit');
      if (a.site || a.project) label += ' (' + (a.site || a.project) + ')';
      opt.value = id;
      opt.textContent = label;
      sel.appendChild(opt);
    });
  } else {
    ['IMS-001','IMS-002','IMS-003','IMS-004','IMS-005'].forEach(function(id) {
      var opt = document.createElement('option');
      opt.value = id; opt.textContent = id + ' — Internal HSE Audit';
      sel.appendChild(opt);
    });
  }
  imsApRenderUI();
}`;

if (content.includes(oldRefresh.trim())) {
  content = content.replace(oldRefresh, newRefresh);
  console.log('Fixed imsApRefresh');
} else {
  const idx = content.indexOf('function imsApRefresh()');
  const end = content.indexOf('\n}', idx) + 2;
  if (idx > -1) {
    content = content.slice(0, idx) + newRefresh + content.slice(end);
    console.log('Fixed imsApRefresh (fallback)');
  } else {
    console.log('Not found');
  }
}

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
const check = fs.readFileSync(path);
console.log('First 3 bytes:', check[0], check[1], check[2]);
console.log('Size:', check.length);

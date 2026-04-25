const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');

// 1. Add Bulk Import button next to Export Excel in Register tab
const exportBtn = 'onclick="incExportExcel()"';
if(c.includes(exportBtn) && !c.includes('incBulkImport')) {
  c = c.replace(
    exportBtn,
    'onclick="incExportExcel()" id="inc-export-btn"'
  );
  // Inject bulk import button after export button
  c = c.replace(
    'id="inc-export-btn"',
    'id="inc-export-btn" style="margin-right:6px;"'
  );
}

// 2. Fix watchIncTable and injectAIButton to use correct IDs
c = c.replace(
  "document.querySelectorAll('#inc-tbody tr')",
  "document.querySelectorAll('#inc-register-tbody tr')"
);
c = c.replace(
  "row.getAttribute('data-inc')",
  "row.cells[0] && row.cells[0].textContent.trim()"
);
c = c.replace(
  "window.incShowApproval(incNo)",
  "window.incShowApproval && window.incShowApproval(incNo)"
);

// 3. Fix injectAIButton to create container if not exists  
const oldAIBtn = "function injectAIButton() {\n  var container = document.getElementById('rca-ai-btn-container');\n  if(container && !document.getElementById('rca-ai-btn')) {";
const newAIBtn = "function injectAIButton() {\n  var container = document.getElementById('rca-ai-btn-container');\n  if(!container) {\n    var rcaPanel = document.getElementById('investigation-rca');\n    if(rcaPanel) {\n      container = document.createElement('div');\n      container.id = 'rca-ai-btn-container';\n      container.style.cssText = 'margin:10px 14px 0;';\n      rcaPanel.insertBefore(container, rcaPanel.firstChild);\n    }\n  }\n  if(container && !document.getElementById('rca-ai-btn')) {";
if(c.includes(oldAIBtn)) {
  c = c.replace(oldAIBtn, newAIBtn);
  console.log('Fixed injectAIButton');
}

// 4. Fix capa email injection to use correct tbody
c = c.replace(
  "document.querySelectorAll('#capa-tbody tr')",
  "document.querySelectorAll('#capa-tbody tr, .capa-row')"
);

fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Done. Size:', c.length);
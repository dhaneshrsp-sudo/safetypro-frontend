$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.tabresp1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('eiaExportMatrix')) {
    Write-Host "Already added tab responsive features"
    return
}

$append = @"


  // ========= RESPONSIVE ACTIONS FOR MATRIX/ANALYSIS/OCP TABS =========
  
  // MATRIX: click a cell to filter Register by that Sv/Pr combo
  window.eiaMatrixCellClick = function(s, p){
    // Navigate to Register sub-tab
    var regTab = [].slice.call(document.querySelectorAll('.ac-sub-tab')).find(function(t){
      var oc = t.getAttribute('onclick') || '';
      return oc.indexOf("'register'") >= 0 && oc.indexOf("'aspect'") >= 0;
    });
    if(regTab) regTab.click();
    // Filter register to aspects matching Sv AND Pr
    var data = (window.ASPECT_DATA || []);
    var filtered = data.filter(function(a){ return a.Sv === s && a.Pr === p; });
    if(typeof window.aspectRenderRegister === 'function'){
      window.aspectRenderRegister(filtered);
    }
    // Show banner indicating filter is applied
    setTimeout(function(){
      var panel = document.getElementById('aspect-register');
      if(!panel) return;
      var banner = document.getElementById('eia-matrix-filter-banner');
      if(!banner){
        banner = document.createElement('div');
        banner.id = 'eia-matrix-filter-banner';
        banner.style.cssText = 'margin:8px 0;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);border-radius:6px;color:#3B82F6;font-size:11px;display:flex;justify-content:space-between;align-items:center;';
        panel.insertBefore(banner, panel.firstChild);
      }
      banner.innerHTML = '<span>&#128270; Filtered: Severity ' + s + ' &times; Probability ' + p + ' (' + filtered.length + ' aspects)</span><button onclick="eiaClearMatrixFilter()" style="background:transparent;border:1px solid #3B82F6;color:#3B82F6;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:10px;">Clear &times;</button>';
    }, 200);
  };
  window.eiaClearMatrixFilter = function(){
    var banner = document.getElementById('eia-matrix-filter-banner');
    if(banner) banner.remove();
    if(typeof window.aspectRenderRegister === 'function') window.aspectRenderRegister();
  };
  
  // Patch matrix renderer to add onclick + filter banner
  var origMatrixRender = window.eaiaMatrixRender;
  window.eaiaMatrixRender = function(){
    if(typeof origMatrixRender === 'function') origMatrixRender();
    // Add click handlers to matrix cells
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var grid = host.querySelector('div[style*="grid-template-columns"]');
    if(!grid) return;
    var cells = grid.children;
    // First 6 are headers (L\S, P1-P5), then 5 rows of (label + 5 cells)
    // Cell at index 6+6*row+col for each S row
    for(var s = 5; s >= 1; s--){
      var rowOffset = 6 + (5 - s) * 6; // row 0 is S=5
      for(var p = 1; p <= 5; p++){
        var cellIdx = rowOffset + p; // rowOffset is label, rowOffset+1..5 are cells
        var cell = cells[cellIdx];
        if(cell && !cell.getAttribute('data-matrix-click-bound')){
          cell.setAttribute('data-matrix-click-bound', '1');
          var sv = s, pr = p;
          (function(_s, _p){
            cell.addEventListener('click', function(){ window.eiaMatrixCellClick(_s, _p); });
          })(sv, pr);
        }
      }
    }
    // Add action toolbar to matrix panel if not present
    var panel = document.getElementById('aspect-matrix');
    if(panel && !panel.querySelector('#eia-matrix-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-matrix-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eiaExportMatrix()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export PNG</button>' +
        '<button onclick="eaiaMatrixRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#8635; Refresh</button>' +
        '<button onclick="eiaMatrixHighlightSig()" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#EF4444;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#9888; Highlight Significant</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  
  window.eiaExportMatrix = function(){
    alert('Matrix Export (PNG/Excel) - Coming Soon.\n\nWill export 5x5 heatmap as PNG image for reports, or Excel file with significance counts per Sv/Pr combination.');
  };
  window.eiaMatrixHighlightSig = function(){
    var cells = document.querySelectorAll('#eaia-matrix-content div[data-matrix-click-bound]');
    cells.forEach(function(c){ c.style.outline = c.textContent.match(/\d+ S/) ? '3px solid #EF4444' : 'none'; });
  };
  
  // ANALYSIS: add export buttons
  var origAnalysisRender = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if(typeof origAnalysisRender === 'function') origAnalysisRender();
    var panel = document.getElementById('aspect-analysis');
    if(panel && !panel.querySelector('#eia-analysis-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-analysis-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eiaExportAnalysis()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export Report</button>' +
        '<button onclick="eaiaAnalysisRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#8635; Refresh</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  window.eiaExportAnalysis = function(){
    alert('Analysis Report Export - Coming Soon.\n\nWill generate a PDF/Excel report with all 4 charts + stats for ISO 14001 management review (Cl.9.3).');
  };
  
  // OCP: add functional filter buttons + export
  var origOcpRender = window.eaiaOcpRender;
  window.eaiaOcpRender = function(filter){
    // Call original with filter applied
    var data = (window.ASPECT_DATA || []).filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; });
    if(filter === 'gaps'){ data = data.filter(function(a){ return a.gap && a.gap.trim() && a.gap.trim() !== ''; }); }
    // Manually render with filtered data
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match current filter.</div>';
      return;
    }
    var cols = '60px 1.5fr 1.5fr 2fr 1.5fr 1fr 1.5fr 80px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    var fullData = window.ASPECT_DATA || [];
    data.forEach(function(a){
      var eiaId = 'EIA-' + String(fullData.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      var rSc = a.rSc || 0;
      var compliant = rSc < 36;
      var status = compliant ? 'Compliant' : 'Review';
      var statusCol = compliant ? '#22C55E' : '#F59E0B';
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.activity + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.aspect + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:8px 6px;color:' + statusCol + ';font-weight:600;">' + status + '</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
    
    // Add toolbar with filter buttons + export
    var panel = document.getElementById('aspect-ocp');
    if(panel && !panel.querySelector('#eia-ocp-toolbar')){
      var toolbar = document.createElement('div');
      toolbar.id = 'eia-ocp-toolbar';
      toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;';
      toolbar.innerHTML = 
        '<button onclick="eaiaOcpRender()" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3B82F6;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">All Significant</button>' +
        '<button onclick="eaiaOcpRender(\"gaps\")" style="background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#9888; With Gaps Only</button>' +
        '<button onclick="eiaExportOcp()" style="background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#22C55E;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">&#128196; Export OCP List</button>';
      var firstCard = panel.querySelector('.card');
      if(firstCard) firstCard.insertBefore(toolbar, firstCard.firstChild);
    }
  };
  window.eiaExportOcp = function(){
    alert('OCP Export - Coming Soon.\n\nWill export all Operational Control Procedures as Word document (SOP format) with headers, Procedure steps, Responsibility matrix, Frequency schedule - ISO 14001 Cl.8.1 aligned.');
  };
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added responsive features to Matrix/Analysis/OCP tabs"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.tabresp1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

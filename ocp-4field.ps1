$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.ocp4field.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__OCP4FIELDS_V1__')) {
    Write-Host "Already patched - skipping"
    return
}

$append = @"


  // ========= __OCP4FIELDS_V1__ OCP 4-Field Filter + Analysis Layout =========
  (function(){
    // Seed realistic demo OCP fields onto ASPECT_DATA (protected by 'undefined' check)
    var seedData = [
      {drafted:true, status:'complete', gap:''},                                              // 0 Soil/Dust - COMPLETE
      {drafted:true, status:'in-progress', gap:'Discharge limits exceeded 2x in Q3'},         // 1 Wash-water
      {drafted:true, status:'complete', gap:''},                                              // 2 Metal scrap - COMPLETE
      {drafted:false, status:'pending', gap:'No capture ventilation at welding stations'},    // 3 Fumes - OCP REQUIRED
      {drafted:true, status:'complete', gap:''},                                              // 4 Vibration - COMPLETE
      {drafted:true, status:'in-progress', gap:'Low-VOC paint spec pending approval'},        // 5 VOC
      {drafted:false, status:'pending', gap:''},                                              // 6 Cement dust - OCP REQUIRED
      {drafted:true, status:'complete', gap:''},                                              // 7 Oil spill - COMPLETE
      {drafted:true, status:'in-progress', gap:'CPCB compliance cert overdue'},               // 8 DG flue gas
      {drafted:false, status:'pending', gap:'SOP not circulated to site teams'}               // 9 last aspect
    ];
    if(window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)){
      window.ASPECT_DATA.forEach(function(a, i){
        var seed = seedData[i] || {drafted:false, status:'pending', gap:''};
        if(typeof a.ocpDrafted === 'undefined') a.ocpDrafted = seed.drafted;
        if(typeof a.implStatus === 'undefined') a.implStatus = seed.status;
        if(!a.gap || !a.gap.trim()) a.gap = seed.gap;
      });
    }
  })();
  
  // Override eaiaOcpRender with 4-way filter support
  window.eaiaOcpRender = function(filter){
    var fullData = window.ASPECT_DATA || [];
    var data = fullData.filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; });
    if(filter === 'gaps'){
      data = data.filter(function(a){ return a.gap && a.gap.trim(); });
    } else if(filter === 'required'){
      data = data.filter(function(a){ return !a.ocpDrafted; });
    } else if(filter === 'complete'){
      data = data.filter(function(a){ return a.ocpDrafted && a.implStatus === 'complete' && (!a.gap || !a.gap.trim()); });
    }
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    if(data.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No aspects match this filter.</div>';
      return;
    }
    var cols = '60px 1.3fr 1.3fr 1.6fr 1.3fr 1fr 1fr 110px';
    var html = '<div style="display:grid;grid-template-columns:' + cols + ';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">' + h + '</div>';
    });
    html += '</div>';
    data.forEach(function(a){
      var eiaId = 'EIA-' + String(fullData.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      // Combined status logic
      var stText, stCol;
      if(!a.ocpDrafted){ stText = '&#9888; OCP Needed'; stCol = '#F59E0B'; }
      else if(a.gap && a.gap.trim()){ stText = '&#9888; Review Gap'; stCol = '#F59E0B'; }
      else if(a.implStatus === 'complete'){ stText = '&#9989; Compliant'; stCol = '#22C55E'; }
      else if(a.implStatus === 'in-progress'){ stText = '&#9201; In Progress'; stCol = '#3B82F6'; }
      else { stText = '&#9898; Pending'; stCol = '#94A3B8'; }
      html += '<div style="display:grid;grid-template-columns:' + cols + ';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">' + eiaId + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.activity + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">' + a.aspect + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + ocpType + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + freq + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">' + resp + '</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">ISO 14001 Cl.8.1</div>';
      html += '<div style="padding:8px 6px;color:' + stCol + ';font-weight:600;">' + stText + '</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
  };
  
  // Hook native HTML dropdown onchange="eaiaOCPRender()" (capital CP)
  window.eaiaOCPRender = function(){
    var sel = document.getElementById('ocp-filter');
    var val = sel ? sel.value : 'ALL';
    var filterMap = { 'ALL':null, 'GAP':'gaps', 'OCP':'required', 'COMPLETE':'complete' };
    window.eaiaOcpRender(filterMap[val] || null);
  };
  
  // Fix Analysis stats layout (grid parent was breaking stats line)
  var origAnalysis2 = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if(typeof origAnalysis2 === 'function') origAnalysis2();
    var stats = document.getElementById('eaia-analysis-stats');
    if(stats){
      var data = (window.ASPECT_DATA || []);
      var total = data.length;
      var sig = data.filter(function(a){ return (a.Sc*a.Sv*a.Pr*a.Du*a.De) >= 36; }).length;
      var alarp = data.filter(function(a){ return (a.rSc || 0) < 36; }).length;
      stats.style.cssText = 'display:flex !important;flex-direction:row !important;grid-template-columns:none !important;gap:24px;flex-wrap:wrap;padding:10px 14px;font-size:11px;color:var(--t2);align-items:center;';
      stats.innerHTML = 
        '<div><span style="color:var(--t3);">Total aspects:</span> <strong style="color:var(--t1);margin-left:4px;font-size:13px;">' + total + '</strong></div>' +
        '<div><span style="color:var(--t3);">Significant:</span> <strong style="color:#EF4444;margin-left:4px;font-size:13px;">' + sig + '</strong></div>' +
        '<div><span style="color:var(--t3);">ALARP achieved:</span> <strong style="color:#22C55E;margin-left:4px;font-size:13px;">' + alarp + '</strong></div>';
    }
  };
  
  // Remove duplicate chart titles (renderChart adds title on top of card's existing header)
  setInterval(function(){
    ['eaia-chart-activity','eaia-chart-cond','eaia-chart-score','eaia-chart-legal'].forEach(function(id){
      var chart = document.getElementById(id);
      if(!chart) return;
      var firstDiv = chart.firstElementChild;
      if(firstDiv && firstDiv.tagName === 'DIV' && firstDiv.style.fontWeight === '700' && firstDiv.getAttribute('data-dedup') !== '1'){
        firstDiv.style.display = 'none';
        firstDiv.setAttribute('data-dedup', '1');
      }
    });
  }, 1000);
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added OCP 4-field filter + stats layout fix + chart title dedup"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.ocp4field.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

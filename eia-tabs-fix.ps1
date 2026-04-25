$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.tabsfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('eaiaMatrixRender')) {
    Write-Host "Functions already present - skipping"
    return
}

# Append 3 functions BEFORE the final })();
$append = @"


  // ========= EIA SUB-TAB RENDER FUNCTIONS =========
  
  function getEiaData(){ return (window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)) ? window.ASPECT_DATA : []; }
  function eiaScore(a){ return (a.Sc||0) * (a.Sv||0) * (a.Pr||0) * (a.Du||0) * (a.De||0); }
  function eiaIsSig(a){ return eiaScore(a) >= 36; }
  function eiaResScore(a){ return a.rSc || 0; }
  function eiaAlarp(a){ return eiaResScore(a) < 36; }
  
  // ===== MATRIX: 5x5 Severity x Probability heatmap =====
  window.eaiaMatrixRender = function(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var data = getEiaData();
    if(data.length === 0){
      host.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);">No aspect data available.</div>';
      return;
    }
    // Group by Sv x Pr
    var buckets = {};
    data.forEach(function(a){
      var k = a.Sv + ',' + a.Pr;
      if(!buckets[k]) buckets[k] = [];
      buckets[k].push(a);
    });
    var html = '<div style="display:grid;grid-template-columns:60px repeat(5,1fr);gap:3px;max-width:640px;margin-top:10px;">';
    html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:9px;color:var(--t3);font-weight:700;">Sv\\Pr</div>';
    for(var p = 1; p <= 5; p++){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">P'+p+'</div>';
    }
    for(var s = 5; s >= 1; s--){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">S'+s+'</div>';
      for(var p = 1; p <= 5; p++){
        var cell = buckets[s+','+p] || [];
        var count = cell.length;
        var sigCount = cell.filter(eiaIsSig).length;
        var score = s * p;
        var bg, fg;
        if(score >= 16){ bg='#EF4444'; fg='#fff'; }
        else if(score >= 10){ bg='#F59E0B'; fg='#000'; }
        else if(score >= 5){ bg='#3B82F6'; fg='#fff'; }
        else { bg='#22C55E'; fg='#000'; }
        if(count === 0){ bg='var(--raised)'; fg='var(--t3)'; }
        var tip = count > 0 ? cell.map(function(a){ return a.aspect + (eiaIsSig(a)?' [S]':''); }).join('; ') : 'No aspects';
        html += '<div title="'+tip.replace(/"/g,'&quot;')+'" style="background:'+bg+';color:'+fg+';padding:14px 6px;text-align:center;font-size:15px;font-weight:700;border-radius:4px;cursor:pointer;">'+count+(sigCount>0?' <span style=\"font-size:8px;background:rgba(0,0,0,.3);padding:1px 4px;border-radius:3px;\">'+sigCount+' S</span>':'')+'</div>';
      }
    }
    html += '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:18px;font-size:10px;color:var(--t2);flex-wrap:wrap;">';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#22C55E;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Low (&lt;5)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#3B82F6;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Medium (5-9)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#F59E0B;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>High (10-15)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#EF4444;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Very High (&ge;16)</div>';
    html += '<div style="margin-left:auto;color:var(--t3);">S = Significant count in cell</div>';
    html += '</div>';
    host.innerHTML = html;
  };
  
  // ===== ANALYSIS: Stats + 4 charts (text-based bars) =====
  window.eaiaAnalysisRender = function(){
    var data = getEiaData();
    var total = data.length;
    var sig = data.filter(eiaIsSig).length;
    var alarp = data.filter(eiaAlarp).length;
    var stats = document.getElementById('eaia-analysis-stats');
    if(stats) stats.innerHTML = 'Total aspects: <strong>'+total+'</strong> | Significant: <strong style="color:#EF4444;">'+sig+'</strong> | ALARP achieved: <strong style="color:#22C55E;">'+alarp+'</strong>';
    
    // Chart by Activity
    var byActivity = {};
    data.forEach(function(a){ byActivity[a.activity] = (byActivity[a.activity]||0) + 1; });
    renderChart('eaia-chart-activity', 'Aspects by Activity', byActivity, '#3B82F6');
    
    // Chart by Condition
    var byCond = {N:0, A:0, E:0};
    data.forEach(function(a){ byCond[a.cond] = (byCond[a.cond]||0) + 1; });
    renderChart('eaia-chart-cond', 'Aspects by Condition (N/A/E)', {Normal: byCond.N, Abnormal: byCond.A, Emergency: byCond.E}, '#8B5CF6');
    
    // Chart by Score Band
    var bands = {'Low (<20)':0, 'Med (20-35)':0, 'High (36-60)':0, 'Very High (>60)':0};
    data.forEach(function(a){
      var s = eiaScore(a);
      if(s < 20) bands['Low (<20)']++;
      else if(s < 36) bands['Med (20-35)']++;
      else if(s < 60) bands['High (36-60)']++;
      else bands['Very High (>60)']++;
    });
    renderChart('eaia-chart-score', 'Score Distribution', bands, '#F59E0B');
    
    // Chart by Legal Compliance
    var byLC = {'LC Compliant (Y)':0, 'LC Non-compliant (N)':0};
    data.forEach(function(a){ a.LC === 'Y' ? byLC['LC Compliant (Y)']++ : byLC['LC Non-compliant (N)']++; });
    renderChart('eaia-chart-legal', 'Legal Compliance Status', byLC, '#22C55E');
  };
  
  function renderChart(id, title, dataObj, color){
    var host = document.getElementById(id);
    if(!host) return;
    var entries = Object.keys(dataObj);
    var maxVal = Math.max.apply(null, entries.map(function(k){ return dataObj[k]; }));
    if(maxVal === 0) maxVal = 1;
    var html = '<div style="font-size:11px;font-weight:700;color:var(--t1);margin-bottom:10px;">'+title+'</div>';
    entries.forEach(function(k){
      var val = dataObj[k];
      var pct = Math.round(val / maxVal * 100);
      html += '<div style="margin-bottom:6px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--t2);margin-bottom:2px;"><span>'+k+'</span><span style="font-weight:700;color:var(--t1);">'+val+'</span></div>' +
        '<div style="background:var(--raised);height:6px;border-radius:3px;overflow:hidden;">' +
        '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:3px;"></div>' +
        '</div></div>';
    });
    host.innerHTML = html;
  }
  
  // ===== OCP: Operational Control Procedures for significant aspects =====
  window.eaiaOcpRender = function(){
    var tbody = document.getElementById('eaia-ocp-tbody');
    if(!tbody) return;
    var data = getEiaData();
    var sig = data.filter(eiaIsSig);
    if(sig.length === 0){
      tbody.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);font-size:11px;">No significant aspects requiring OCP currently.</div>';
      return;
    }
    // Header row + data rows in a DIV grid
    var cols = '60px 1.5fr 1.5fr 2fr 1.5fr 1fr 1.5fr 80px';
    var html = '<div style="display:grid;grid-template-columns:'+cols+';background:var(--raised);font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);">';
    ['ID','Activity','Aspect','OCP Required','Frequency','Responsible','Ref Std','Status'].forEach(function(h){
      html += '<div style="padding:8px 6px;border-right:0.5px solid var(--border);">'+h+'</div>';
    });
    html += '</div>';
    sig.forEach(function(a, i){
      var eiaId = 'EIA-' + String(data.indexOf(a)+1).padStart(3, '0');
      var ocpType = (a.cond === 'E') ? 'Emergency Preparedness Plan' : 'SOP + Work Instruction';
      var freq = (a.cond === 'E') ? 'On-event + Mock Drill' : 'Continuous + Weekly Audit';
      var resp = a.authority || 'HSE Manager';
      var refStd = 'ISO 14001 Cl.8.1';
      var status = eiaAlarp(a) ? 'Compliant' : 'Review';
      var statusCol = eiaAlarp(a) ? '#22C55E' : '#F59E0B';
      html += '<div style="display:grid;grid-template-columns:'+cols+';border-bottom:0.5px solid var(--border);font-size:9px;">';
      html += '<div style="padding:8px 6px;color:var(--t2);font-weight:600;">'+eiaId+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">'+a.activity+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t1);">'+a.aspect+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+ocpType+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+freq+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t2);">'+resp+'</div>';
      html += '<div style="padding:8px 6px;color:var(--t3);font-size:8px;">'+refStd+'</div>';
      html += '<div style="padding:8px 6px;color:'+statusCol+';font-weight:600;">'+status+'</div>';
      html += '</div>';
    });
    tbody.innerHTML = html;
    // Update count badges if present
    var totalBadge = document.querySelector('#aspect-ocp .card span[data-ocp="total"]');
    if(totalBadge) totalBadge.textContent = sig.length;
  };
  
  // Auto-render when tab becomes active (in case onclick fires before fn exists)
  function autoRenderTabs(){
    try { window.eaiaMatrixRender(); } catch(e){}
    try { window.eaiaAnalysisRender(); } catch(e){}
    try { window.eaiaOcpRender(); } catch(e){}
  }
  setTimeout(autoRenderTabs, 1500);
  setTimeout(autoRenderTabs, 3000);
"@

# Insert BEFORE the final })();
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added Matrix, Analysis, OCP render functions to eia-enhancements.js"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.tabsfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

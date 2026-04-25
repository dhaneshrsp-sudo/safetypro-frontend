$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.iresmatrix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__IRES_MATRIX_V1__')) { Write-Host "Toggle already present"; return }

$append = @"


  // ========= __IRES_MATRIX_V1__ P0.2 Inherent vs Residual Matrix Toggle =========
  // Seed rSv, rPr on all 10 aspects representing post-control residual factors.
  // Pattern: Effective controls reduce Sv by 1-2 points, Pr by 1-2 points.
  (function(){
    var resSeed = [
      {rSv:2, rPr:2}, // 0 Soil/Dust - effective dust suppression
      {rSv:3, rPr:2}, // 1 Wash-water - partial (gap open)
      {rSv:2, rPr:2}, // 2 Metal scrap - well controlled
      {rSv:3, rPr:3}, // 3 Fumes - OCP missing, minimal reduction
      {rSv:2, rPr:1}, // 4 Vibration - engineering controls
      {rSv:2, rPr:2}, // 5 VOC - in progress
      {rSv:3, rPr:2}, // 6 Cement dust - OCP needed, limited reduction
      {rSv:2, rPr:1}, // 7 Oil spill - bund, trays, drill protocols
      {rSv:3, rPr:2}, // 8 DG flue gas - partial
      {rSv:3, rPr:3}  // 9 aspect - SOP not circulated
    ];
    if(window.ASPECT_DATA && Array.isArray(window.ASPECT_DATA)){
      window.ASPECT_DATA.forEach(function(a, i){
        var seed = resSeed[i] || {rSv:a.Sv, rPr:a.Pr};
        a.rSv = seed.rSv;
        a.rPr = seed.rPr;
      });
    }
  })();
  
  window.__matrixMode = localStorage.getItem('sp_matrix_mode') || 'inherent';
  
  window.eiaSetMatrixMode = function(mode){
    window.__matrixMode = mode;
    try { localStorage.setItem('sp_matrix_mode', mode); } catch(e){}
    window.eaiaMatrixRender();
  };
  
  // Override matrix renderer with mode-aware version
  window.eaiaMatrixRender = function(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host) return;
    var data = (window.ASPECT_DATA || []);
    if(data.length === 0){
      host.innerHTML = '<div style="padding:40px;text-align:center;color:var(--t3);">No aspect data available.</div>';
      return;
    }
    var mode = window.__matrixMode || 'inherent';
    var isRes = (mode === 'residual');
    
    // Group aspects by Sv x Pr (or rSv x rPr)
    var buckets = {};
    data.forEach(function(a){
      var svVal = isRes ? (a.rSv || a.Sv) : a.Sv;
      var prVal = isRes ? (a.rPr || a.Pr) : a.Pr;
      var k = svVal + ',' + prVal;
      if(!buckets[k]) buckets[k] = [];
      buckets[k].push(a);
    });
    
    // Count significant in this mode
    function isSigInMode(a){
      if(isRes){ return (a.rSc || 0) >= 36; }
      return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36;
    }
    var sigCount = data.filter(isSigInMode).length;
    var totalCount = data.length;
    var reductionPct = isRes && totalCount > 0 ? Math.round((1 - sigCount / Math.max(1, data.filter(function(a){
      return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36;
    }).length)) * 100) : 0;
    
    // === Build toggle + title + matrix HTML ===
    var html = '';
    
    // Mode toggle
    html += '<div id="eia-matrix-mode-toggle" style="display:flex;gap:0;margin-bottom:14px;background:var(--raised);padding:3px;border-radius:8px;width:fit-content;">';
    html += '<button onclick="eiaSetMatrixMode(' + "'inherent'" + ')" style="background:' + (isRes?'transparent':'#EF4444') + ';color:' + (isRes?'var(--t2)':'#fff') + ';border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:all .15s;">&#127919; Inherent Risk</button>';
    html += '<button onclick="eiaSetMatrixMode(' + "'residual'" + ')" style="background:' + (isRes?'#22C55E':'transparent') + ';color:' + (isRes?'#fff':'var(--t2)') + ';border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:all .15s;">&#128737; Residual Risk (After Controls)</button>';
    html += '</div>';
    
    // Contextual description
    var descText = isRes ? 
      'Risk remaining AFTER existing controls are applied. ALARP target: all cells &lt; 5\u00D75.' :
      'Raw risk BEFORE any controls. Worst-case view for risk identification.';
    html += '<div style="font-size:10px;color:var(--t3);margin-bottom:14px;font-style:italic;">' + descText + '</div>';
    
    // Matrix grid
    html += '<div style="display:grid;grid-template-columns:60px repeat(5,1fr);gap:3px;max-width:640px;">';
    html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:9px;color:var(--t3);font-weight:700;">Sv\\Pr</div>';
    for(var p = 1; p <= 5; p++){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">P' + p + '</div>';
    }
    for(var s = 5; s >= 1; s--){
      html += '<div style="background:var(--raised);padding:8px;text-align:center;font-size:10px;font-weight:700;color:var(--t2);">S' + s + '</div>';
      for(var p = 1; p <= 5; p++){
        var cellList = buckets[s + ',' + p] || [];
        var count = cellList.length;
        var sigHere = cellList.filter(isSigInMode).length;
        var score = s * p;
        var bg, fg;
        if(score >= 16){ bg='#EF4444'; fg='#fff'; }
        else if(score >= 10){ bg='#F59E0B'; fg='#000'; }
        else if(score >= 5){ bg='#3B82F6'; fg='#fff'; }
        else { bg='#22C55E'; fg='#000'; }
        if(count === 0){ bg='var(--raised)'; fg='var(--t3)'; }
        var tip = count > 0 ? cellList.map(function(a){ return a.aspect + (isSigInMode(a)?' [S]':''); }).join('; ') : 'No aspects';
        html += '<div title="' + tip.replace(/"/g,'&quot;') + '" onclick="eiaMatrixCellClick(' + s + ',' + p + ')" style="background:' + bg + ';color:' + fg + ';padding:14px 6px;text-align:center;font-size:15px;font-weight:700;border-radius:4px;cursor:pointer;">' + count + (sigHere > 0 ? ' <span style=\"font-size:8px;background:rgba(0,0,0,.3);padding:1px 4px;border-radius:3px;\">' + sigHere + ' S</span>' : '') + '</div>';
      }
    }
    html += '</div>';
    
    // Summary stats
    html += '<div style="margin-top:18px;padding:12px 14px;background:var(--raised);border-radius:6px;border-left:3px solid ' + (isRes?'#22C55E':'#EF4444') + ';">';
    html += '<div style="font-size:11px;color:var(--t1);font-weight:700;margin-bottom:4px;">' + (isRes ? '&#128737; Residual Risk Summary' : '&#127919; Inherent Risk Summary') + '</div>';
    html += '<div style="font-size:10px;color:var(--t2);">';
    html += 'Total aspects: <strong style="color:var(--t1);">' + totalCount + '</strong> \u00B7 ';
    html += (isRes?'Significant (residual):':'Significant (inherent):') + ' <strong style="color:' + (isRes?'#F59E0B':'#EF4444') + ';">' + sigCount + '</strong>';
    if(isRes){
      var inherentSig = data.filter(function(a){ return ((a.Sc||0)*(a.Sv||0)*(a.Pr||0)*(a.Du||0)*(a.De||0)) >= 36; }).length;
      var absReduction = inherentSig - sigCount;
      var pct = inherentSig > 0 ? Math.round((absReduction / inherentSig) * 100) : 0;
      html += ' \u00B7 <span style="color:#22C55E;">&#10003; Reduction: ' + absReduction + ' aspects (' + pct + '%)</span>';
    }
    html += '</div></div>';
    
    // Legend
    html += '<div style="display:flex;gap:12px;margin-top:14px;font-size:10px;color:var(--t2);flex-wrap:wrap;align-items:center;">';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#22C55E;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Low (&lt;5)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#3B82F6;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Medium (5-9)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#F59E0B;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>High (10-15)</div>';
    html += '<div><span style="display:inline-block;width:12px;height:12px;background:#EF4444;border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Very High (&ge;16)</div>';
    html += '<div style="margin-left:auto;color:var(--t3);font-size:9px;">ISO 31010 &middot; ISO 14001 Cl.6.1.2</div>';
    html += '</div>';
    
    host.innerHTML = html;
  };
  
  // Initial render to apply saved mode
  setTimeout(function(){ try { window.eaiaMatrixRender(); } catch(e){} }, 1200);
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added Inherent vs Residual matrix toggle"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.iresmatrix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.scaleinfo1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__SCALE_INFO_V1__')) { Write-Host "Scale info already added"; return }

$append = @"


  // ========= __SCALE_INFO_V1__ P0.2.1 Scale Definitions + Legend Color Fix =========
  
  var SV_SCALE = {
    1: {name:'Negligible', safety:'No injury / minor discomfort', env:'No measurable impact', rev:'Immediate'},
    2: {name:'Minor', safety:'First aid only', env:'Local nuisance, no regulatory breach', rev:'< 1 week'},
    3: {name:'Moderate', safety:'Lost time injury / medical treatment', env:'Local impact, minor regulatory concern', rev:'< 1 month'},
    4: {name:'Major', safety:'Serious injury / permanent disability', env:'Off-site impact, regulatory notice', rev:'6-12 months'},
    5: {name:'Catastrophic', safety:'Fatality / multiple casualties', env:'Irreversible major environmental damage', rev:'> 1 year / never'}
  };
  var PR_SCALE = {
    1: {name:'Rare', freq:'Once per 5+ years', ex:'Structural collapse at rest / worst credible'},
    2: {name:'Unlikely', freq:'Once per year', ex:'Major spill from storage tank'},
    3: {name:'Possible', freq:'Once per quarter', ex:'Minor injury from mishandled PPE'},
    4: {name:'Likely', freq:'Once per month', ex:'Dust generation during excavation'},
    5: {name:'Almost Certain', freq:'Weekly or more', ex:'Noise emission during concrete work'}
  };
  
  // Patch legend + add tooltips + add scale reference panel - runs after matrix render
  function enhanceMatrixScaleInfo(){
    var host = document.getElementById('eaia-matrix-content');
    if(!host || host.getAttribute('data-scale-enhanced') === '1') return;
    
    // 1. Add tooltips to S1-S5 row labels and P1-P5 col headers
    var grid = host.querySelector('div[style*="grid-template-columns"]');
    if(!grid) return;
    var cells = grid.children;
    // Row 0: 6 cells (Sv\\Pr label + P1-P5 headers)
    for(var p = 1; p <= 5; p++){
      var pCell = cells[p]; // P1 at idx 1, P5 at idx 5
      if(pCell && !pCell.title){
        var ps = PR_SCALE[p];
        pCell.title = 'P' + p + ' - ' + ps.name + '\nFrequency: ' + ps.freq + '\nExample: ' + ps.ex;
        pCell.style.cursor = 'help';
      }
    }
    // Rows 1-5: first cell is S label. S5 is at row 1 start (idx 6), S4 at idx 12, etc.
    for(var r = 0; r < 5; r++){
      var sIdx = 6 + r * 6;
      var sVal = 5 - r; // S5 first
      var sCell = cells[sIdx];
      if(sCell && !sCell.title){
        var ss = SV_SCALE[sVal];
        sCell.title = 'S' + sVal + ' - ' + ss.name + '\nSafety: ' + ss.safety + '\nEnvironment: ' + ss.env + '\nReversibility: ' + ss.rev;
        sCell.style.cursor = 'help';
      }
    }
    
    // 2. Insert "Scale Reference" collapsible panel after matrix grid
    if(!host.querySelector('#eia-scale-ref')){
      var refPanel = document.createElement('div');
      refPanel.id = 'eia-scale-ref';
      refPanel.style.cssText = 'margin-top:16px;background:var(--raised);border-radius:6px;overflow:hidden;border:1px solid var(--border);';
      refPanel.innerHTML = 
        '<div onclick="eiaToggleScaleRef()" id="eia-scale-ref-header" style="padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;color:var(--t1);user-select:none;">' +
          '<span>&#128214; Scale Reference (ISO 31010 / ISO 14001)</span>' +
          '<span id="eia-scale-ref-chevron" style="color:var(--t3);font-size:14px;transition:transform .2s;">&#9654;</span>' +
        '</div>' +
        '<div id="eia-scale-ref-body" style="display:none;padding:14px;border-top:1px solid var(--border);font-size:10px;">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
            '<div>' +
              '<div style="font-weight:700;color:var(--t1);margin-bottom:8px;font-size:11px;">&#127919; SEVERITY (S) - Impact if event occurs</div>' +
              '<table style="width:100%;border-collapse:collapse;font-size:9px;">' +
                '<thead><tr style="background:var(--bg);color:var(--t3);"><th style="padding:5px;text-align:left;">Level</th><th style="padding:5px;text-align:left;">Safety</th><th style="padding:5px;text-align:left;">Environment</th><th style="padding:5px;text-align:left;">Recovery</th></tr></thead>' +
                '<tbody>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#22C55E !important;font-weight:700;">S1 Negligible</td><td style="padding:5px;color:var(--t2);">No injury</td><td style="padding:5px;color:var(--t2);">No measurable impact</td><td style="padding:5px;color:var(--t2);">Immediate</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#3B82F6 !important;font-weight:700;">S2 Minor</td><td style="padding:5px;color:var(--t2);">First aid only</td><td style="padding:5px;color:var(--t2);">Local nuisance</td><td style="padding:5px;color:var(--t2);">&lt; 1 week</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F59E0B !important;font-weight:700;">S3 Moderate</td><td style="padding:5px;color:var(--t2);">LTI / medical</td><td style="padding:5px;color:var(--t2);">Local impact</td><td style="padding:5px;color:var(--t2);">&lt; 1 month</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F97316 !important;font-weight:700;">S4 Major</td><td style="padding:5px;color:var(--t2);">Permanent disability</td><td style="padding:5px;color:var(--t2);">Off-site impact</td><td style="padding:5px;color:var(--t2);">6-12 months</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#EF4444 !important;font-weight:700;">S5 Catastrophic</td><td style="padding:5px;color:var(--t2);">Fatality</td><td style="padding:5px;color:var(--t2);">Irreversible damage</td><td style="padding:5px;color:var(--t2);">&gt; 1 year</td></tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div>' +
              '<div style="font-weight:700;color:var(--t1);margin-bottom:8px;font-size:11px;">&#127919; PROBABILITY (P) - Likelihood of occurrence</div>' +
              '<table style="width:100%;border-collapse:collapse;font-size:9px;">' +
                '<thead><tr style="background:var(--bg);color:var(--t3);"><th style="padding:5px;text-align:left;">Level</th><th style="padding:5px;text-align:left;">Frequency</th><th style="padding:5px;text-align:left;">Construction example</th></tr></thead>' +
                '<tbody>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#22C55E !important;font-weight:700;">P1 Rare</td><td style="padding:5px;color:var(--t2);">Once / 5+ years</td><td style="padding:5px;color:var(--t2);">Structural collapse at rest</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#3B82F6 !important;font-weight:700;">P2 Unlikely</td><td style="padding:5px;color:var(--t2);">Once per year</td><td style="padding:5px;color:var(--t2);">Major tank spill</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F59E0B !important;font-weight:700;">P3 Possible</td><td style="padding:5px;color:var(--t2);">Once per quarter</td><td style="padding:5px;color:var(--t2);">Minor injury from PPE</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#F97316 !important;font-weight:700;">P4 Likely</td><td style="padding:5px;color:var(--t2);">Once per month</td><td style="padding:5px;color:var(--t2);">Dust during excavation</td></tr>' +
                  '<tr style="border-top:1px solid var(--border);"><td style="padding:5px;color:#EF4444 !important;font-weight:700;">P5 Almost Certain</td><td style="padding:5px;color:var(--t2);">Weekly or more</td><td style="padding:5px;color:var(--t2);">Noise in concrete work</td></tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:12px;padding:8px 10px;background:var(--bg);border-radius:4px;color:var(--t3);font-size:9px;line-height:1.5;">' +
            '<strong style="color:var(--t2);">Tip:</strong> Hover over S1-S5 row labels or P1-P5 column headers in the matrix for quick tooltips.' +
          '</div>' +
        '</div>';
      host.appendChild(refPanel);
    }
    
    host.setAttribute('data-scale-enhanced', '1');
  }
  
  window.eiaToggleScaleRef = function(){
    var body = document.getElementById('eia-scale-ref-body');
    var chev = document.getElementById('eia-scale-ref-chevron');
    if(!body || !chev) return;
    if(body.style.display === 'none'){
      body.style.display = 'block';
      chev.style.transform = 'rotate(90deg)';
    } else {
      body.style.display = 'none';
      chev.style.transform = 'rotate(0deg)';
    }
  };
  
  // Wrap eaiaMatrixRender to apply scale info post-render
  var _prevMatrixRender = window.eaiaMatrixRender;
  window.eaiaMatrixRender = function(){
    if(typeof _prevMatrixRender === 'function') _prevMatrixRender();
    // Clear flag so enhancements re-apply on mode toggle
    var host = document.getElementById('eaia-matrix-content');
    if(host) host.removeAttribute('data-scale-enhanced');
    setTimeout(enhanceMatrixScaleInfo, 50);
  };
  
  // =========  Fix pre-existing HTML legend (Low/Moderate/Significant dots) =========
  // The card header legend uses inline background:#xxx that gets stripped by CSS sentinel
  // Run periodically to find and add !important colors
  function fixExistingLegendDots(){
    var card = document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card');
    if(!card) return;
    // Find legend spans - they have small fixed dimensions and are inline-block
    var dots = card.querySelectorAll('span[style*="width:10px"], span[style*="width:12px"], span[style*="width: 10px"], span[style*="width: 12px"]');
    dots.forEach(function(dot){
      if(dot.getAttribute('data-legend-fixed') === '1') return;
      // Get the text after this dot to determine its color
      var parent = dot.parentElement;
      if(!parent) return;
      var txt = parent.textContent.toLowerCase();
      var color = null;
      if(txt.indexOf('low') >= 0 && txt.indexOf('1') >= 0) color = '#22C55E';
      else if(txt.indexOf('moderate') >= 0) color = '#F59E0B';
      else if(txt.indexOf('significant') >= 0 || txt.indexOf('\u226536') >= 0) color = '#EF4444';
      else if(txt.indexOf('medium') >= 0) color = '#3B82F6';
      else if(txt.indexOf('high') >= 0 && txt.indexOf('very') < 0) color = '#F59E0B';
      else if(txt.indexOf('very high') >= 0) color = '#EF4444';
      if(color){
        dot.style.setProperty('background', color, 'important');
        dot.style.setProperty('background-color', color, 'important');
        dot.setAttribute('data-legend-fixed', '1');
      }
    });
  }
  setInterval(fixExistingLegendDots, 1500);
  [500, 1200, 2500].forEach(function(ms){ setTimeout(fixExistingLegendDots, ms); });
  
  setTimeout(function(){ try { window.eaiaMatrixRender(); } catch(e){} }, 1300);
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added scale info (tooltips + collapsible panel + legend dot fix)"

$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.scaleinfo1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

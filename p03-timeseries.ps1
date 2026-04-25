$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

# SAFETY GUARDS
$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT: files too small (js=$jsSize html=$htmlSize)"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.tsv1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__TIMESERIES_V1__')) { Write-Host "P0.3 already present - skipping"; return }

$append = @"


  // ========= __TIMESERIES_V1__ P0.3 Time-series Trending on Analysis Tab =========
  
  // Seed 52 weekly historical snapshots (realistic improvement trajectory over past year)
  (function(){
    var existing = null;
    try { existing = JSON.parse(localStorage.getItem('sp_eia_history') || 'null'); } catch(e){}
    if (existing && existing.length >= 40) return; // already seeded
    
    var snapshots = [];
    var today = new Date();
    for (var weeksAgo = 52; weeksAgo >= 0; weeksAgo--) {
      var d = new Date(today);
      d.setDate(d.getDate() - weeksAgo * 7);
      var progress = 1 - (weeksAgo / 52); // 0 one year ago -> 1 today
      var noise = function(amp){ return (Math.random() - 0.5) * amp; };
      
      var total = Math.round(15 - 5 * progress + noise(1));
      var sig = Math.round(14 - 4 * progress + noise(1.5));
      var resSig = Math.round(12 - 11 * progress + noise(1)); // big residual improvement
      var avgScore = Math.round((72 - 35 * progress + noise(5)) * 10) / 10;
      var alarpAchieved = Math.round(3 + 6 * progress + noise(1));
      
      snapshots.push({
        date: d.toISOString().split('T')[0],
        total: Math.max(8, Math.min(15, total)),
        significant: Math.max(5, Math.min(14, sig)),
        residualSignificant: Math.max(0, Math.min(12, resSig)),
        avgScore: Math.max(20, avgScore),
        alarp: Math.max(0, Math.min(10, alarpAchieved))
      });
    }
    try { localStorage.setItem('sp_eia_history', JSON.stringify(snapshots)); } catch(e){}
  })();
  
  window.__tsRange = localStorage.getItem('sp_ts_range') || '90d';
  
  window.eiaSetTrendRange = function(range){
    window.__tsRange = range;
    try { localStorage.setItem('sp_ts_range', range); } catch(e){}
    window.eiaRenderTrend();
  };
  
  window.eiaRenderTrend = function(){
    var host = document.getElementById('eia-trend-container');
    if (!host) return;
    var history = [];
    try { history = JSON.parse(localStorage.getItem('sp_eia_history') || '[]'); } catch(e){}
    if (history.length < 2){ host.innerHTML = '<div style="padding:20px;color:var(--t3);">No historical data.</div>'; return; }
    
    var range = window.__tsRange || '90d';
    var days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    var filtered = history.filter(function(s){ return new Date(s.date) >= cutoff; });
    if (filtered.length < 2){ host.innerHTML = '<div style="padding:20px;color:var(--t3);">Not enough data in range.</div>'; return; }
    
    var current = filtered[filtered.length - 1];
    var previous = filtered[0];
    
    function delta(key, lowerIsBetter){
      var d = current[key] - previous[key];
      var pct = previous[key] !== 0 ? Math.round((d / previous[key]) * 100) : 0;
      var icon, col;
      if (d === 0){ icon = '&#8594;'; col = '#94A3B8'; }
      else if (d < 0){ icon = '&#8595;'; col = lowerIsBetter ? '#22C55E' : '#EF4444'; }
      else { icon = '&#8593;'; col = lowerIsBetter ? '#EF4444' : '#22C55E'; }
      return { d: d, pct: Math.abs(pct), icon: icon, col: col };
    }
    
    var sigD = delta('significant', true);
    var resD = delta('residualSignificant', true);
    var scoreD = delta('avgScore', true);
    var alarpD = delta('alarp', false);
    
    // Build SVG sparkline of Significant count
    var vals = filtered.map(function(s){ return s.significant; });
    var resVals = filtered.map(function(s){ return s.residualSignificant; });
    var W = 640, H = 140, PAD = 28;
    var allVals = vals.concat(resVals);
    var maxV = Math.max.apply(null, allVals);
    var minV = Math.min.apply(null, allVals);
    var rangeV = Math.max(1, maxV - minV);
    
    function pointsFor(arr){
      return arr.map(function(v, i){
        var x = PAD + (i / (arr.length - 1)) * (W - 2 * PAD);
        var y = H - PAD - ((v - minV) / rangeV) * (H - 2 * PAD);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
    }
    
    var sigPoints = pointsFor(vals);
    var resPoints = pointsFor(resVals);
    
    // Area fill for significant (fill below the line)
    var sigAreaPoints = PAD + ',' + (H - PAD) + ' ' + sigPoints + ' ' + (W - PAD) + ',' + (H - PAD);
    
    // X-axis labels (first, middle, last)
    var firstDate = new Date(filtered[0].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    var midDate = new Date(filtered[Math.floor(filtered.length/2)].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    var lastDate = new Date(filtered[filtered.length - 1].date).toLocaleDateString('en-IN', {month:'short', day:'numeric'});
    
    var html = '';
    
    // Range selector
    html += '<div style="display:flex;gap:0;margin-bottom:14px;background:var(--raised);padding:3px;border-radius:6px;width:fit-content;">';
    ['30d', '90d', '365d'].forEach(function(r){
      var active = r === range;
      var labels = {'30d':'30 days','90d':'90 days','365d':'1 year'};
      html += '<button onclick="eiaSetTrendRange(\'' + r + '\')" style="background:' + (active?'#3B82F6':'transparent') + ';color:' + (active?'#ffffff':'#E6EDF3') + ' !important;border:0;padding:6px 14px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:700;">' + labels[r] + '</button>';
    });
    html += '</div>';
    
    // KPI cards with deltas
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">';
    function kpi(label, val, d, unit){
      return '<div style="background:var(--raised);padding:10px 12px;border-radius:6px;border-left:3px solid ' + d.col + ';">' +
        '<div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px;">' + label + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:8px;">' +
          '<div style="font-size:18px;font-weight:700;color:var(--t1);">' + val + (unit||'') + '</div>' +
          '<div style="font-size:11px;color:' + d.col + ' !important;font-weight:600;">' + d.icon + ' ' + d.pct + '%</div>' +
        '</div>' +
        '<div style="font-size:8px;color:var(--t3);margin-top:2px;">vs ' + range + ' ago</div>' +
      '</div>';
    }
    html += kpi('Significant (Inherent)', current.significant, sigD, '');
    html += kpi('Significant (Residual)', current.residualSignificant, resD, '');
    html += kpi('Avg Score', current.avgScore, scoreD, '');
    html += kpi('ALARP Achieved', current.alarp, alarpD, '');
    html += '</div>';
    
    // SVG trend chart
    html += '<div style="background:var(--raised);padding:14px;border-radius:6px;margin-bottom:14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--t1);">Significance Trend (ISO 14001 Cl.9.1)</div>';
    html += '<div style="display:flex;gap:12px;font-size:9px;color:var(--t3);">';
    html += '<div><span style="display:inline-block;width:10px;height:2px;background:#EF4444 !important;vertical-align:middle;margin-right:4px;"></span>Inherent</div>';
    html += '<div><span style="display:inline-block;width:10px;height:2px;background:#22C55E !important;vertical-align:middle;margin-right:4px;"></span>Residual</div>';
    html += '</div></div>';
    html += '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">';
    // Grid lines (horizontal, 3 lines)
    for (var g = 0; g <= 3; g++){
      var gy = PAD + (g / 3) * (H - 2 * PAD);
      html += '<line x1="' + PAD + '" y1="' + gy + '" x2="' + (W-PAD) + '" y2="' + gy + '" stroke="#1E293B" stroke-width="0.5"/>';
      var gVal = maxV - (g / 3) * rangeV;
      html += '<text x="' + (PAD-6) + '" y="' + (gy+3) + '" fill="#64748B" font-size="9" text-anchor="end">' + Math.round(gVal) + '</text>';
    }
    // Area fill (inherent, red at 10% opacity)
    html += '<polygon points="' + sigAreaPoints + '" fill="rgba(239,68,68,0.15)"/>';
    // Residual line (green)
    html += '<polyline points="' + resPoints + '" fill="none" stroke="#22C55E" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // Inherent line (red)
    html += '<polyline points="' + sigPoints + '" fill="none" stroke="#EF4444" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // Current point markers
    var lastIdx = vals.length - 1;
    var lastX = PAD + (W - 2 * PAD);
    var lastSigY = H - PAD - ((vals[lastIdx] - minV) / rangeV) * (H - 2 * PAD);
    var lastResY = H - PAD - ((resVals[lastIdx] - minV) / rangeV) * (H - 2 * PAD);
    html += '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastSigY.toFixed(1) + '" r="3.5" fill="#EF4444"/>';
    html += '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastResY.toFixed(1) + '" r="3.5" fill="#22C55E"/>';
    // X labels
    html += '<text x="' + PAD + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="start">' + firstDate + '</text>';
    html += '<text x="' + (W/2) + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="middle">' + midDate + '</text>';
    html += '<text x="' + (W-PAD) + '" y="' + (H-8) + '" fill="#64748B" font-size="9" text-anchor="end">' + lastDate + '</text>';
    html += '</svg>';
    html += '</div>';
    
    // Insight callout
    var insight = '';
    if (resD.d < 0){
      insight = '<div style="padding:10px 14px;background:rgba(34,197,94,0.12);border-left:3px solid #22C55E;border-radius:6px;color:var(--t2);font-size:10px;">' +
        '<strong style="color:#22C55E !important;">&#10003; Improvement detected:</strong> Residual significant aspects reduced by <strong style="color:var(--t1);">' + Math.abs(resD.d) + '</strong> over selected period. Control effectiveness is increasing.' +
      '</div>';
    } else if (sigD.d > 0){
      insight = '<div style="padding:10px 14px;background:rgba(239,68,68,0.12);border-left:3px solid #EF4444;border-radius:6px;color:var(--t2);font-size:10px;">' +
        '<strong style="color:#EF4444 !important;">&#9888; Attention:</strong> Inherent significant aspects increased by <strong style="color:var(--t1);">' + sigD.d + '</strong>. Review new activity scope.' +
      '</div>';
    } else {
      insight = '<div style="padding:10px 14px;background:rgba(148,163,184,0.1);border-left:3px solid #94A3B8;border-radius:6px;color:var(--t2);font-size:10px;">' +
        'Risk profile is <strong style="color:var(--t1);">stable</strong> over selected period. Continue monitoring.' +
      '</div>';
    }
    html += insight;
    
    host.innerHTML = html;
  };
  
  // Inject trend container into Analysis panel + wire into render
  function injectTrendContainer(){
    var panel = document.getElementById('aspect-analysis');
    if (!panel) return;
    if (document.getElementById('eia-trend-container')) return;
    var stats = document.getElementById('eaia-analysis-stats');
    var container = document.createElement('div');
    container.id = 'eia-trend-container';
    container.style.cssText = 'margin:14px 0 20px 0;';
    // Insert after stats, before the 4-chart grid
    if (stats && stats.parentElement){
      stats.parentElement.insertBefore(container, stats.nextSibling);
    } else {
      panel.insertBefore(container, panel.firstChild);
    }
  }
  
  // Hook existing eaiaAnalysisRender
  var _prevAnalysis = window.eaiaAnalysisRender;
  window.eaiaAnalysisRender = function(){
    if (typeof _prevAnalysis === 'function') _prevAnalysis();
    injectTrendContainer();
    setTimeout(window.eiaRenderTrend, 50);
  };
  
  // Run on load
  [600, 1500, 3000].forEach(function(ms){
    setTimeout(function(){
      injectTrendContainer();
      try { window.eiaRenderTrend(); } catch(e){}
    }, ms);
  });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added P0.3 time-series trending"

# Bump version with safety checks
$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.tsv1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html content small"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: after replace too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
$final = (Get-Item $htmlFile).Length
Write-Host "Final HTML size: $final bytes"

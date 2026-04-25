$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

# SAFETY: check file sizes first
$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) {
    Write-Host "ABORT: files too small (js=$jsSize, html=$htmlSize)"
    return
}
Write-Host "Pre-check OK: js=$jsSize, html=$htmlSize"

Copy-Item $f "$f.dotsv4.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Fresh marker - not blocked by any prior marker
$marker = '__DOTS_V4_FORCE__'
if ($js.Contains($marker)) { 
    Write-Host "V4 already present - will proceed to bump only"
} else {
    $append = @"


  // ========= $marker Legend dot fix - runs on interval + uses class-based CSS injection =========
  (function(){
    // Inject a stylesheet rule targeting our marker class with MAXIMUM specificity
    var styleTag = document.createElement('style');
    styleTag.id = 'sp-legend-dot-styles';
    styleTag.textContent = 'html body div.sp-legend-dot-forced[data-dot-color="green"] { background: #10B981 !important; background-color: #10B981 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="amber"] { background: #F59E0B !important; background-color: #F59E0B !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="red"] { background: #EF4444 !important; background-color: #EF4444 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; } html body div.sp-legend-dot-forced[data-dot-color="blue"] { background: #3B82F6 !important; background-color: #3B82F6 !important; width: 14px !important; height: 14px !important; display: inline-block !important; border-radius: 3px !important; flex-shrink: 0 !important; opacity: 1 !important; }';
    (document.head || document.documentElement).appendChild(styleTag);
    
    function tagLegendDots(){
      var card = document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card');
      if(!card) return;
      var divs = card.querySelectorAll('div');
      for(var i = 0; i < divs.length; i++){
        var el = divs[i];
        if(el.getAttribute('data-dot-color')) continue; // already tagged
        if(el.children.length > 0) continue;
        var style = el.getAttribute('style') || '';
        var hasSize = style.indexOf('width:14px') >= 0 || style.indexOf('width:12px') >= 0 || style.indexOf('width:10px') >= 0;
        var hasBR = style.indexOf('border-radius') >= 0;
        if(!hasSize || !hasBR) continue;
        
        // Determine color
        var color = null;
        if(style.indexOf('#10B981') >= 0 || style.indexOf('#22C55E') >= 0){ color = 'green'; }
        else if(style.indexOf('#F59E0B') >= 0){ color = 'amber'; }
        else if(style.indexOf('#EF4444') >= 0){ color = 'red'; }
        else if(style.indexOf('#3B82F6') >= 0){ color = 'blue'; }
        else {
          var txt = (el.parentElement?.textContent || '').toLowerCase();
          if(txt.indexOf('low') >= 0) color = 'green';
          else if(txt.indexOf('moderate') >= 0) color = 'amber';
          else if(txt.indexOf('significant') >= 0) color = 'red';
          else if(txt.indexOf('medium') >= 0) color = 'blue';
          else if(txt.indexOf('very high') >= 0) color = 'red';
          else if(txt.indexOf('high') >= 0) color = 'amber';
        }
        if(!color) continue;
        el.classList.add('sp-legend-dot-forced');
        el.setAttribute('data-dot-color', color);
      }
    }
    
    // Run at intervals + on load
    setInterval(tagLegendDots, 2000);
    [200, 600, 1200, 2500, 5000].forEach(function(ms){ setTimeout(tagLegendDots, ms); });
  })();
"@

    $close = '})();'
    $lastIdx = $js.LastIndexOf($close)
    if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
    $js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
    
    if ($js.Length -lt 10000) { Write-Host "ABORT: js too small after edit"; return }
    [System.IO.File]::WriteAllText($f, $js, $utf8)
    Write-Host "Added $marker block to eia-enhancements.js"
}

# Safety re-check before HTML bump
$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }

Copy-Item $htmlFile "$htmlFile.dotsv4.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html content small"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: replaced too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
$final = (Get-Item $htmlFile).Length
Write-Host "Final HTML size: $final bytes"

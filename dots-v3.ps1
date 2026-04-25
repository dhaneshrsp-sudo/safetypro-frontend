$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

# SAFETY GUARD - abort if either file is corrupted/missing
$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) {
    Write-Host "ABORT: js=$jsSize htm=$htmlSize (too small, aborting)"
    return
}
Write-Host "Pre-check OK: js=$jsSize htm=$htmlSize"

Copy-Item $f "$f.dotsv3.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__DOTS_V3__')) {
    Write-Host "Dots V3 fix already present - skipping"
    return
}

# Append a NEW function that targets DIV dots (not SPAN) and forces size + color with !important
$append = @"


  // ========= __DOTS_V3__ Legend dot fix for DIV elements (HTML uses DIV, not SPAN) =========
  function fixLegendDotsV3(){
    var card = document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card');
    if(!card) return;
    var divs = card.querySelectorAll('div');
    for(var i = 0; i < divs.length; i++){
      var el = divs[i];
      if(el.getAttribute('data-legend-fixed-v3') === '1') continue;
      if(el.children.length > 0) continue; // dots are leaf nodes
      var style = el.getAttribute('style') || '';
      // Match a dot: has fixed width (10/12/14px) AND border-radius
      var isDotLike = (style.indexOf('width:14px') >= 0 || style.indexOf('width:12px') >= 0 || style.indexOf('width:10px') >= 0) && style.indexOf('border-radius') >= 0;
      if(!isDotLike) continue;
      // Extract intended color from inline style
      var colorMatch = style.match(/background\s*:\s*(#[0-9A-Fa-f]{3,8}|rgb[^;]+)/);
      var color = colorMatch ? colorMatch[1] : null;
      // If no color in style, infer from sibling text
      if(!color){
        var parent = el.parentElement;
        var txt = parent ? parent.textContent.toLowerCase() : '';
        if(txt.indexOf('low') >= 0) color = '#10B981';
        else if(txt.indexOf('moderate') >= 0) color = '#F59E0B';
        else if(txt.indexOf('significant') >= 0) color = '#EF4444';
        else if(txt.indexOf('medium') >= 0) color = '#3B82F6';
        else if(txt.indexOf('very high') >= 0) color = '#EF4444';
        else if(txt.indexOf('high') >= 0) color = '#F59E0B';
      }
      if(!color) continue;
      // Force size + color via inline !important (beats sentinel CSS !important)
      el.style.setProperty('background', color, 'important');
      el.style.setProperty('background-color', color, 'important');
      el.style.setProperty('width', '14px', 'important');
      el.style.setProperty('height', '14px', 'important');
      el.style.setProperty('display', 'inline-block', 'important');
      el.style.setProperty('border-radius', '3px', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.setAttribute('data-legend-fixed-v3', '1');
    }
  }
  setInterval(fixLegendDotsV3, 2000);
  [300, 800, 1500, 3000].forEach(function(ms){ setTimeout(fixLegendDotsV3, ms); });
"@

# Insert before final })();
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)

# Sanity check before write
if ($js.Length -lt 10000) {
    Write-Host "ABORT: resulting JS is only $($js.Length) chars - not writing"
    return
}
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Added fixLegendDotsV3 (targets DIV dots with !important override)"

# Re-check HTML size before bump
$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) {
    Write-Host "ABORT: HTML dropped to $htmlSize2 bytes - not bumping version"
    return
}

Copy-Item $htmlFile "$htmlFile.dotsv3.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) {
    Write-Host "ABORT: HTML content only $($h.Length) chars"
    return
}
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) {
        Write-Host "ABORT: after replace only $($h.Length) chars"
        return
    }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

# Post-check
$final = (Get-Item $htmlFile).Length
Write-Host "Final HTML size: $final bytes"

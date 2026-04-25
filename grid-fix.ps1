$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.gridfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__GRID_FIX_V1__')) { Write-Host "Already fixed"; return }

# Remove the old eia-legal-col-grid style injection AND prevent it from coming back
# Also ensures the new 27-column grid with legal+workflow is used as the single source of truth

$append = @"


  // ========= __GRID_FIX_V1__ Remove stale eia-legal-col-grid style override (24-col) =========
  function killStaleGridStyle(){
    var stale = document.getElementById('eia-legal-col-grid');
    if (stale) stale.remove();
    // Make sure our 27-col style is present and LAST in head (wins cascade)
    var good = document.getElementById('eia-wf-split-override');
    if (good && document.head.lastElementChild !== good) {
      document.head.appendChild(good); // move to end for cascade priority
    }
  }
  setInterval(killStaleGridStyle, 1000);
  [200, 600, 1200, 2500, 5000].forEach(function(ms){ setTimeout(killStaleGridStyle, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added stale grid-style remover + move wf-split to end of head"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.gridfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html small"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: after replace too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
Write-Host "Final HTML: $((Get-Item $htmlFile).Length) bytes"

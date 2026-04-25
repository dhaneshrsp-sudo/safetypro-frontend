$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT: files too small"; return }
Write-Host "Pre-check OK"

Copy-Item $f "$f.wfdedup1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__WF_DEDUP_V1__')) { Write-Host "Already deduped"; return }

# Append - runs periodically to REMOVE old workflow artifacts (span 1 with data-wf-injected)
$append = @"


  // ========= __WF_DEDUP_V1__ Remove OLD single-column workflow injections (keep only split version) =========
  function removeOldWorkflowArtifacts(){
    // Old group header label has data-wf-injected="1"
    var oldGroups = document.querySelectorAll('#eia-group-header [data-wf-injected="1"]');
    oldGroups.forEach(function(el){ el.remove(); });
    // Old sub header label has data-wf-injected="1"
    var oldSubs = document.querySelectorAll('#eia-sub-header [data-wf-injected="1"]');
    oldSubs.forEach(function(el){ el.remove(); });
    // Old data row cells have data-wf-cell="1" (the cramped single cell)
    var oldCells = document.querySelectorAll('[data-wf-cell="1"]');
    oldCells.forEach(function(el){ el.remove(); });
    // Also remove old grid override style (was 25 cols, now we want 27)
    var oldStyle = document.getElementById('eia-wf-grid-override');
    if (oldStyle) oldStyle.remove();
  }
  setInterval(removeOldWorkflowArtifacts, 1500);
  [300, 1000, 2500, 5000].forEach(function(ms){ setTimeout(removeOldWorkflowArtifacts, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: Added dedup to remove old single-col workflow artifacts"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.wfdedup1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT: html too small"; return }
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

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.gridfix2.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__GRID_FIX_V2__')) { Write-Host "Already fixed"; return }

# Approach: OVERWRITE the stale style's content with the correct 27-col grid
# This way even if the old interval keeps creating it, the content is compatible
$append = @"


  // ========= __GRID_FIX_V2__ Override stale eia-legal-col-grid with 27-col grid =========
  var CORRECT_27_GRID = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 90px 130px 44px 56px 50px 100px';
  var CORRECT_CSS_RULE = '#eia-group-header, #eia-sub-header, #eaia-tbody > div { grid-template-columns: ' + CORRECT_27_GRID + ' !important; }';
  
  function ensureCorrectGridStyle(){
    // 1. Rewrite stale eia-legal-col-grid content to 27-col version
    var stale = document.getElementById('eia-legal-col-grid');
    if (stale && stale.textContent.indexOf('90px 130px 44px') < 0){
      stale.textContent = CORRECT_CSS_RULE;
    }
    
    // 2. Ensure our own eia-wf-split-override has correct content
    var good = document.getElementById('eia-wf-split-override');
    if (good && good.textContent.indexOf('90px 130px 44px') < 0){
      good.textContent = CORRECT_CSS_RULE;
    }
    
    // 3. If good doesnt exist, create it at end of head
    if (!good){
      good = document.createElement('style');
      good.id = 'eia-wf-split-override';
      good.textContent = CORRECT_CSS_RULE;
      document.head.appendChild(good);
    }
    
    // 4. Force good to be LAST in head (cascade priority)
    if (document.head.lastElementChild !== good){
      document.head.appendChild(good);
    }
  }
  
  setInterval(ensureCorrectGridStyle, 800);
  [100, 400, 1000, 2000, 4000].forEach(function(ms){ setTimeout(ensureCorrectGridStyle, ms); });
"@

$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT: no IIFE close"; return }
$js = $js.Substring(0, $lastIdx) + $append + "`n" + $js.Substring($lastIdx)
if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "OK: GRID_FIX_V2 - rewrite stale style content to 27-col grid"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.gridfix2.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Length -lt 100000) { Write-Host "ABORT"; return }
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
Write-Host "Final: $((Get-Item $htmlFile).Length) bytes"

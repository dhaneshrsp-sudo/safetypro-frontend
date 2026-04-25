$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.calm1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__CALM_V1__')) { Write-Host "Already calm"; return }

# === FIX 1: Revert button padding to smaller (2px 6px, font 8px) but KEEP filled bg ===
$oldBig = "padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:700;white-space:nowrap;width:100%;box-shadow:0 1px 2px rgba(0,0,0,.2);"
$newSmall = "padding:2px 5px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;width:100%;"
if ($js.Contains($oldBig)) {
    $js = $js.Replace($oldBig, $newSmall)
    Write-Host "Fix 1: Buttons sized down (2x5 padding, 8px font, no shadow)"
}

# === FIX 2: Catch any remaining short intervals (500, 4000, 5000, 6000) not caught earlier ===
$js = [regex]::Replace($js, 'setInterval\(([^,]+),\s*(200|300|400|500|600|700|4000|5000|6000|7000|8000|9000)\)', 'setInterval($1, 15000)')
Write-Host "Fix 2: Any remaining short intervals -> 15000ms"

# === FIX 3: Consolidate multiple setTimeouts - most of them fire redundantly during load ===
# Find all setTimeout(..., 300|500|600|1000|1200|1500|2500|3000|3500|4500|5000|6000) and replace with guard
# The cleanest approach: replace each dedicated setTimeout trigger with a single consolidated one
# Strategy: replace setTimeout patterns that are inside forEach([300,1500,3000]...) type arrays
# Change multi-shot setTimeout arrays to single [1800] shot

# Pattern: [a, b, c, ...].forEach(function(ms){ setTimeout(fn, ms) })
# Replace the array with just [1800]
$js = [regex]::Replace($js, '\[(\d+,\s*)+\d+\]\.forEach\(function\(ms\)\{', '[1800].forEach(function(ms){')
Write-Host "Fix 3: All timeout-arrays reduced to single [1800] trigger"

# Add marker
$marker = "`n  // __CALM_V1__ initial render consolidated to single pass (1800ms)`n"
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT"; return }
$js = $js.Substring(0, $lastIdx) + $marker + $js.Substring($lastIdx)

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved all fixes"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.calm1.bak" -Force
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

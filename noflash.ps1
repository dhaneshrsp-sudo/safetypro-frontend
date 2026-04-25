$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.noflash1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__NOFLASH_V1__')) { Write-Host "Already applied"; return }

# Count current setIntervals in the file
$ivCount = ([regex]::Matches($js, 'setInterval\(')).Count
Write-Host "Current setInterval calls in JS: $ivCount"

# Strategy: find setInterval(fn, 800..2500) and change to setInterval(fn, 10000) - slow them all down to 10s
# Capture each interval duration
$intervals = [regex]::Matches($js, 'setInterval\(([^,]+),\s*(\d+)\)')
Write-Host "Found $($intervals.Count) setInterval calls with durations:"
foreach ($m in $intervals) {
    $ms = [int]$m.Groups[2].Value
    Write-Host "  $ms ms"
}

# Replace short intervals (< 5000ms) with 10000ms
$js2 = [regex]::Replace($js, 'setInterval\(([^,]+),\s*(800|1000|1500|2000|2500|3000)\)', {
    param($m)
    $fn = $m.Groups[1].Value
    'setInterval(' + $fn + ', 10000)'
})

$replacedCount = ([regex]::Matches($js2, 'setInterval\(([^,]+),\s*10000\)')).Count
Write-Host "After replacement: $replacedCount intervals now at 10000ms"

# Add marker
$marker = "`n  // __NOFLASH_V1__ intervals throttled to 10s to reduce repaint flicker`n"
$close = '})();'
$lastIdx = $js2.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT"; return }
$js2 = $js2.Substring(0, $lastIdx) + $marker + $js2.Substring($lastIdx)

if ($js2.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js2, $utf8)
Write-Host "OK: Throttled all short intervals to 10s"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.noflash1.bak" -Force
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

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.calm2.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__CALM_V2__')) { Write-Host "Already V2"; return }

# === FIX 1: Revert oversized buttons to small filled ===
$oldBig = "padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:700;white-space:nowrap;width:100%;box-shadow:0 1px 2px rgba(0,0,0,.2);"
$newSmall = "padding:2px 5px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;width:100%;"
$c1 = 0
if ($js.Contains($oldBig)) { $js = $js.Replace($oldBig, $newSmall); $c1 = 1 }
Write-Host "Fix 1: button size reverted = $c1"

# === FIX 2: Catch ALL short intervals (200-9000ms) -> 15000ms ===
$before = ([regex]::Matches($js, 'setInterval\(')).Count
$js = [regex]::Replace($js, 'setInterval\(([^,]+?),\s*(\d{3,4})\)', {
    param($m)
    $ms = [int]$m.Groups[2].Value
    if ($ms -lt 10000) {
        return 'setInterval(' + $m.Groups[1].Value + ', 15000)'
    } else {
        return $m.Value
    }
})
Write-Host "Fix 2: $before setIntervals examined, short ones -> 15000ms"

# === FIX 3: Consolidate multi-shot setTimeout arrays to single [1800] ===
# Pattern: [300, 1500, 3000].forEach(function(ms){ -> [1800].forEach(function(ms){
$c3 = 0
$pattern = '\[(\d+\s*,\s*)+\d+\]\.forEach\(function\(ms\)\{'
$matches = [regex]::Matches($js, $pattern)
$c3 = $matches.Count
$js = [regex]::Replace($js, $pattern, '[1800].forEach(function(ms){')
Write-Host "Fix 3: $c3 multi-shot timeout arrays -> single [1800]"

# Add V2 marker
$marker = "`n  // __CALM_V2__ single-pass initial render + small filled buttons + 15s intervals`n"
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT"; return }
$js = $js.Substring(0, $lastIdx) + $marker + $js.Substring($lastIdx)

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved, new js size: $((Get-Item $f).Length)"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.calm2.bak" -Force
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
Write-Host "Final HTML: $((Get-Item $htmlFile).Length) bytes"

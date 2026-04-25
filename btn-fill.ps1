$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) { Write-Host "ABORT"; return }
Write-Host "Pre-check OK: js=$jsSize html=$htmlSize"

Copy-Item $f "$f.btnfill1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

if ($js.Contains('__BTNFILL_V1__')) { Write-Host "Already applied"; return }

# === FIX 1: Change outline button style to FILLED ===
# Old: background:rgba(255,255,255,.04);border:1px solid ' + t.col + ';color:' + t.col + ' !important
# New: background:' + t.col + ';border:0;color:#ffffff !important
$oldBtn = "background:rgba(255,255,255,.04);border:1px solid ' + t.col + ';color:' + t.col + ' !important"
$newBtn = "background:' + t.col + ';border:0;color:#ffffff !important"
if ($js.Contains($oldBtn)) {
    $js = $js.Replace($oldBtn, $newBtn)
    Write-Host "Fix 1: Buttons changed to FILLED style (colored bg + white text)"
} else {
    Write-Host "WARN Fix 1: old button style pattern not found"
}

# === FIX 2: Throttle ALL short intervals (<5s) to 10s to stop flashing ===
$iv = ([regex]::Matches($js, 'setInterval\(([^,]+),\s*(\d+)\)'))
$short = 0
foreach ($m in $iv) {
    $ms = [int]$m.Groups[2].Value
    if ($ms -lt 5000) { $short++ }
}
Write-Host "Intervals currently < 5s: $short"

$js = [regex]::Replace($js, 'setInterval\(([^,]+),\s*(800|1000|1200|1500|2000|2500|3000)\)', 'setInterval($1, 10000)')
$throttled = ([regex]::Matches($js, 'setInterval\(([^,]+),\s*10000\)')).Count
Write-Host "Fix 2: Now at 10000ms: $throttled"

# === FIX 3: Also make eaiaOcpRender button filled (uses same outline style in OCP if it was there) ===
# Preserve OCP colored outline buttons? Actually let them keep outlined - they are less important
# Keep as-is

# === FIX 4: Slightly increase button padding + add weight for better visual ===
# Find: 'padding:2px 6px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600
# New:  'padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:700
$oldPad = "padding:2px 6px;border-radius:3px;cursor:pointer;font-size:8px;font-weight:600;white-space:nowrap;width:100%;"
$newPad = "padding:4px 8px;border-radius:4px;cursor:pointer;font-size:9px;font-weight:700;white-space:nowrap;width:100%;box-shadow:0 1px 2px rgba(0,0,0,.2);"
if ($js.Contains($oldPad)) {
    $js = $js.Replace($oldPad, $newPad)
    Write-Host "Fix 4: Button padding+weight upgraded"
}

# Add marker
$marker = "`n  // __BTNFILL_V1__ filled buttons + 10s throttle`n"
$close = '})();'
$lastIdx = $js.LastIndexOf($close)
if ($lastIdx -lt 0) { Write-Host "ABORT"; return }
$js = $js.Substring(0, $lastIdx) + $marker + $js.Substring($lastIdx)

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved all fixes"

$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT"; return }
Copy-Item $htmlFile "$htmlFile.btnfill1.bak" -Force
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

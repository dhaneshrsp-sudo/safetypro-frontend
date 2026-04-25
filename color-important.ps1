$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.colorimp1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

$changes = 0

# --- FIX 1: Restore original brand colors first (revert hex-shift from previous deploy if it happened) ---
$revertG = "'#22C560'"
if ($js.Contains($revertG)) { $js = $js.Replace($revertG, "'#22C55E'"); Write-Host "Reverted green to #22C55E"; $changes++ }
$revertR = "'#EF4545'"
if ($js.Contains($revertR)) { $js = $js.Replace($revertR, "'#EF4444'"); Write-Host "Reverted red to #EF4444"; $changes++ }

# --- FIX 2: Toggle buttons - add !important to color so stylesheet cannot override ---
# Inherent button: color:' + (isRes?'#E6EDF3':'#FFFFFF') + '
$oldInhC = "color:' + (isRes?'#E6EDF3':'#FFFFFF') + ';border:0"
$newInhC = "color:' + (isRes?'#E6EDF3':'#FFFFFF') + ' !important;border:0"
if ($js.Contains($oldInhC)) { $js = $js.Replace($oldInhC, $newInhC); Write-Host "Fix 2a: Inherent btn color !important"; $changes++ }

# Residual button: color:' + (isRes?'#FFFFFF':'#E6EDF3') + '
$oldResC = "color:' + (isRes?'#FFFFFF':'#E6EDF3') + ';border:0"
$newResC = "color:' + (isRes?'#FFFFFF':'#E6EDF3') + ' !important;border:0"
if ($js.Contains($oldResC)) { $js = $js.Replace($oldResC, $newResC); Write-Host "Fix 2b: Residual btn color !important"; $changes++ }

# --- FIX 3: Matrix cells - the green cells have black text forced to green by CSS override ---
# Matrix cell inline style builds color from fg variable. Change to apply !important
# Pattern: color:' + fg + ';padding:14px 6px
$oldCell = "color:' + fg + ';padding:14px 6px"
$newCell = "color:' + fg + ' !important;padding:14px 6px"
if ($js.Contains($oldCell)) { $js = $js.Replace($oldCell, $newCell); Write-Host "Fix 3: Matrix cells color !important"; $changes++ }

if ($changes -eq 0) { Write-Host "NO CHANGES - aborting"; return }

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved $changes change(s)"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.colorimp1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

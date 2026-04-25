$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.btnvis1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Replace the toggle button styling to make inactive buttons visible
# Pattern 1: Inherent button
$oldInh = "'<button onclick=" + '"' + "eiaSetMatrixMode(' + " + "`"'inherent'`"" + " + ')" + '"' + " style=" + '"' + "background:' + (isRes?'transparent':'#EF4444') + ';color:' + (isRes?'var(--t2)':'#fff') + ';border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:all .15s;" + '"' + ">&#127919; Inherent Risk</button>'"

$newInh = "'<button onclick=" + '"' + "eiaSetMatrixMode(' + " + "`"'inherent'`"" + " + ')" + '"' + " style=" + '"' + "background:' + (isRes?'#1E293B':'#EF4444') + ';color:' + (isRes?'#E6EDF3':'#FFFFFF') + ';border:" + '" + (isRes?' + "'1px solid #334155'" + ':' + "'0'" + ") + '" + ";padding:7px 18px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700 !important;transition:all .15s;" + '"' + ">&#127919; Inherent Risk</button>'"

# This is getting too complex - let me use a simpler, more reliable approach via regex on smaller chunks

# Approach: find and replace just the color assignments
# For Inherent button: "color:' + (isRes?'var(--t2)':'#fff')"  -> "color:' + (isRes?'#E6EDF3':'#FFFFFF')"
$oldC1 = "color:' + (isRes?'var(--t2)':'#fff')"
$newC1 = "color:' + (isRes?'#E6EDF3':'#FFFFFF')"
if ($js.Contains($oldC1)) {
    $js = $js.Replace($oldC1, $newC1)
    Write-Host "Fix 1a: Inherent btn color brightened"
}

# For Inherent background: "background:' + (isRes?'transparent':'#EF4444')" -> add subtle bg when inactive
$oldB1 = "background:' + (isRes?'transparent':'#EF4444')"
$newB1 = "background:' + (isRes?'#1E293B':'#EF4444')"
if ($js.Contains($oldB1)) {
    $js = $js.Replace($oldB1, $newB1)
    Write-Host "Fix 1b: Inherent btn inactive bg raised"
}

# For Residual button color: "color:' + (isRes?'#fff':'var(--t2)')"  -> "color:' + (isRes?'#FFFFFF':'#E6EDF3')"
$oldC2 = "color:' + (isRes?'#fff':'var(--t2)')"
$newC2 = "color:' + (isRes?'#FFFFFF':'#E6EDF3')"
if ($js.Contains($oldC2)) {
    $js = $js.Replace($oldC2, $newC2)
    Write-Host "Fix 2a: Residual btn inactive color brightened"
}

# For Residual background: "background:' + (isRes?'#22C55E':'transparent')"  -> add subtle bg when inactive
$oldB2 = "background:' + (isRes?'#22C55E':'transparent')"
$newB2 = "background:' + (isRes?'#22C55E':'#1E293B')"
if ($js.Contains($oldB2)) {
    $js = $js.Replace($oldB2, $newB2)
    Write-Host "Fix 2b: Residual btn inactive bg raised"
}

# Force font-weight and add border for definition
# Pattern: "font-weight:700;" -> "font-weight:700;border:1px solid rgba(255,255,255,0.08);"
# But need to be careful not to hit other font-weight usages
# Just target the transition-containing buttons: "font-weight:700;transition:all .15s;"
$oldFW = "font-weight:700;transition:all .15s;"
$newFW = "font-weight:700;border:1px solid rgba(255,255,255,0.1);transition:all .15s;"
$countFW = ([regex]::Matches($js, [regex]::Escape($oldFW))).Count
if ($countFW -gt 0) {
    $js = $js.Replace($oldFW, $newFW)
    Write-Host "Fix 3: Added subtle border to ${countFW} toggle buttons"
}

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.btnvis1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

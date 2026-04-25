$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.rowfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the bug line and replace with correct logic
$old = "if(parent.querySelector('[data-legal-injected=" + '"' + "1" + '"' + "]')) return;"

# Verify it's there
if (-not $js.Contains($old)) {
    Write-Host "OLD pattern not found. Searching for 'data-legal-injected'..."
    $idx = $js.IndexOf('data-legal-injected')
    if ($idx -ge 0) {
        Write-Host "Context:"
        Write-Host $js.Substring([Math]::Max(0, $idx - 80), 200)
    }
    return
}

# New: dont early-return. Instead check per-section
$new = "/* Process header + rows independently - no early return */"

$js = $js.Replace($old, $new)

# Also fix the group header guard - make it check only for groupHdr
# Find: "if(residualGroup){"  and wrap with "if(!groupHdr.querySelector('[data-legal-injected]') && residualGroup){"
$oldG = "if(residualGroup){"
$newG = "if(residualGroup && !groupHdr.querySelector('[data-legal-injected]')){"
if ($js.Contains($oldG)) { $js = $js.Replace($oldG, $newG); Write-Host "Guarded group injection" }

# Same for sub header
$oldS = "if(residualSub){"
$newS = "if(residualSub && !subHdr.querySelector('[data-legal-injected]')){"
if ($js.Contains($oldS)) { $js = $js.Replace($oldS, $newS); Write-Host "Guarded sub-header injection" }

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.rowfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

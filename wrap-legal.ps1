$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
Copy-Item $f "$f.wraptext1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the legal cell style and change nowrap -> normal with break-word
$old = "newLegalCell.style.cssText = 'padding:6px 6px;border-right:0.5px solid var(--border);font-size:8px;color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';"
$new = "newLegalCell.style.cssText = 'padding:6px 8px;border-right:0.5px solid var(--border);font-size:9px;color:var(--t3);white-space:normal;word-break:break-word;line-height:1.35;';"

if ($js.Contains($old)) {
    $js = $js.Replace($old, $new)
    Write-Host "Changed legal cell: nowrap+ellipsis -> normal wrap (line-height 1.35)"
} else {
    Write-Host "ABORT: legal cell style not found - pattern mismatch"
    return
}

# Also widen the column from 140px to 200px so wrapped text is readable
# The grid template has 140px in position 21 (0-indexed: position 20 for legal)
$oldGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 140px 56px 50px 100px'
$newGrid = '70px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 120px 130px 120px 200px 56px 50px 100px'

if ($js.Contains($oldGrid)) {
    $js = $js.Replace($oldGrid, $newGrid)
    Write-Host "Widened LEGAL column: 140px -> 200px"
} else {
    Write-Host "WARN: grid-template pattern not matched - column width unchanged"
}

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved eia-enhancements.js"

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.wraptext1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}

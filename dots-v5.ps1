$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-enhancements.js"
$htmlFile = "$PWD\safetypro_risk_management.html"

$jsSize = (Get-Item $f).Length
$htmlSize = (Get-Item $htmlFile).Length
if ($jsSize -lt 10000 -or $htmlSize -lt 100000) {
    Write-Host "ABORT: js=$jsSize html=$htmlSize"
    return
}
Write-Host "Pre-check OK: js=$jsSize, html=$htmlSize"

Copy-Item $f "$f.dotsv5.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Replace the narrow selector with panel-wide selector
$old = "var card = document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card');"
$new = "var card = document.getElementById('aspect-matrix');"

if ($js.Contains($old)) {
    $js = $js.Replace($old, $new)
    Write-Host "Fix 1: selector widened to #aspect-matrix (panel-wide)"
} else {
    Write-Host "Old selector not found - maybe already fixed or pattern changed"
}

# Also update the second occurrence if present (same pattern in v4 block)
$count = ([regex]::Matches($js, [regex]::Escape("document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card')"))).Count
Write-Host "Remaining similar selectors: $count"
while ($count -gt 0) {
    $js = $js.Replace("document.getElementById('eaia-matrix-card') || document.querySelector('#aspect-matrix .card')", "document.getElementById('aspect-matrix')")
    $count--
}

if ($js.Length -lt 10000) { Write-Host "ABORT: js too small"; return }
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved"

# Bump version
$htmlSize2 = (Get-Item $htmlFile).Length
if ($htmlSize2 -lt 100000) { Write-Host "ABORT: html shrunk"; return }
Copy-Item $htmlFile "$htmlFile.dotsv5.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-enhancements.js?v=$oldV", "eia-enhancements.js?v=$newV")
    if ($h.Length -lt 100000) { Write-Host "ABORT: after replace too small"; return }
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-enhancements.js v=$oldV -> v=$newV"
}
$final = (Get-Item $htmlFile).Length
Write-Host "Final HTML: $final bytes"

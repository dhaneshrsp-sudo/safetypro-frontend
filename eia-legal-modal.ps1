$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\eia-action-modal.js"
Copy-Item $f "$f.addlegal1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Find the fieldRow call for 'Competent Authority' (last field in the view modal)
# Add a legal ref fieldRow AFTER it using eiaFormatLegal if available
$anchor = "fieldRow('Competent Authority', data.authority);"

if (-not $js.Contains($anchor)) {
    Write-Host "ABORT: anchor not found. Searching for 'Competent Authority' context..."
    $idx = $js.IndexOf('Competent Authority')
    if ($idx -ge 0) {
        Write-Host "Context:"
        Write-Host $js.Substring([Math]::Max(0, $idx - 50), 150)
    }
    return
}

$replacement = @"
fieldRow('Competent Authority', data.authority) +
        fieldRow('Legal / Regulatory Reference', (window.eiaFormatLegal && data.legal) ? window.eiaFormatLegal(data.legal, window.eiaGetActiveRegion ? window.eiaGetActiveRegion() : 'GLOBAL') : (data.legal || '—'));
"@

# The anchor ends with ";" so we replace carefully - keep the + concat chain
# Original: "+  fieldRow('Competent Authority', data.authority);"
# Replace with the above multi-line version
if ($js.Contains($anchor)) {
    $js = $js.Replace($anchor, $replacement.Trim())
    [System.IO.File]::WriteAllText($f, $js, $utf8)
    Write-Host "Added legal ref fieldRow to EIA View modal"
}

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.addlegal1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'eia-action-modal\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("eia-action-modal.js?v=$oldV", "eia-action-modal.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped eia-action-modal.js v=$oldV -> v=$newV"
}

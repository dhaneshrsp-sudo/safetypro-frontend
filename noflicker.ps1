$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\hira-enhancements.js"
Copy-Item $f "$f.noflicker1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Disable the 2-second re-render interval - this is what causes the flashing
# Current: "setInterval(renderAll, 2000);"
$old = 'setInterval(renderAll, 2000);'
$new = '/* setInterval disabled to prevent flashing - patchActionCells handles icon refresh */ /* setInterval(renderAll, 2000); */'

if ($js.Contains($old)) {
    $js = $js.Replace($old, $new)
    [System.IO.File]::WriteAllText($f, $js, $utf8)
    Write-Host "OK: disabled 2s render interval in hira-enhancements.js"
} else {
    Write-Host "Pattern not found - showing context:"
    $idx = $js.IndexOf('setInterval')
    if ($idx -ge 0) {
        Write-Host $js.Substring($idx, [Math]::Min(100, $js.Length - $idx))
    }
}

# Bump version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.noflicker1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'hira-enhancements\.js\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("hira-enhancements.js?v=$oldV", "hira-enhancements.js?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped hira-enhancements.js v=$oldV -> v=$newV"
}

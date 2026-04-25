$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.eiaregion1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

if ($h.IndexOf('eia-enhancements.js') -lt 0) {
    $ref = "<script src=`"eia-enhancements.js?v=1`"></script>"
    $bodyClose = $h.LastIndexOf('</body>')
    $h = $h.Substring(0, $bodyClose) + $ref + "`n" + $h.Substring($bodyClose)
    [System.IO.File]::WriteAllText($f, $h, $utf8)
    Write-Host "Added eia-enhancements.js reference"
} else {
    Write-Host "Already present"
}
Write-Host "Backup: $f.eiaregion1.bak"

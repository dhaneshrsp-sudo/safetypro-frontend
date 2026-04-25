$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.hiraenh1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

$ref = "<script src=`"hira-enhancements.js?v=1`"></script>"
if ($h.IndexOf('hira-enhancements.js') -lt 0) {
    $bodyClose = $h.LastIndexOf('</body>')
    $h = $h.Substring(0, $bodyClose) + $ref + "`n" + $h.Substring($bodyClose)
    [System.IO.File]::WriteAllText($f, $h, $utf8)
    Write-Host "Added hira-enhancements.js reference to HTML"
} else {
    Write-Host "Already referenced"
}

Write-Host "Backup: $f.hiraenh1.bak"

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.legalfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove old reference if any, add v=2
$pattern = '<script src="hira-enhancements\.js\?v=\d+"></script>\s*'
$h = [regex]::Replace($h, $pattern, '')
$ref = "<script src=`"hira-enhancements.js?v=2`"></script>"
$bodyClose = $h.LastIndexOf('</body>')
$h = $h.Substring(0, $bodyClose) + $ref + "`n" + $h.Substring($bodyClose)
[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Added hira-enhancements.js?v=2 reference"

Write-Host "Backup: $f.legalfix1.bak"

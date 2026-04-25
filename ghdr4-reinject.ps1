$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.ghdr4.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove ALL existing eia-grouped-header script tags (handle multiple versions)
$pattern = '<script src="eia-grouped-header\.js\?v=\d+"></script>\s*'
$h = [regex]::Replace($h, $pattern, '')

# Add fresh v=4
$externRef = "<script src=`"eia-grouped-header.js?v=4`"></script>"
$bodyClose = $h.LastIndexOf('</body>')
$h = $h.Substring(0, $bodyClose) + $externRef + "`n" + $h.Substring($bodyClose)
[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Added v=4"

# Verify single occurrence
$h2 = [System.IO.File]::ReadAllText($f, $utf8)
$count = ([regex]::Matches($h2, 'eia-grouped-header\.js\?v=\d+')).Count
Write-Host "eia-grouped-header refs: $count (expected 1)"

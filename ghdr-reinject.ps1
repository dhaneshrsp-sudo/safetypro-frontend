$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.ghdr3.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove any existing eia-grouped-header script tag
$pattern = '<script src="eia-grouped-header\.js\?v=\d+"></script>\s*'
$h = [regex]::Replace($h, $pattern, '')
Write-Host "Removed any previous script tags"

# Add fresh v=3 reference
$externRef = "<script src=`"eia-grouped-header.js?v=3`"></script>"
$bodyClose = $h.LastIndexOf('</body>')
$h = $h.Substring(0, $bodyClose) + $externRef + "`n" + $h.Substring($bodyClose)
[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Added fresh v=3 reference"

# Verify
$h2 = [System.IO.File]::ReadAllText($f, $utf8)
$count = ([regex]::Matches($h2, 'eia-grouped-header')).Count
Write-Host "eia-grouped-header references in file: $count (expected 1)"

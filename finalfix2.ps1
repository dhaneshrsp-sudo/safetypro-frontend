$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.finalfix2.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# STEP 1: Remove ALL eia-grouped-header.js script tags (handles any version)
$pattern = '<script src="eia-grouped-header\.js\?v=\d+"></script>\s*'
$matches = ([regex]::Matches($h, $pattern)).Count
$h = [regex]::Replace($h, $pattern, '')
Write-Host "Removed $matches eia-grouped-header script tag(s)"

# STEP 2: Find HTML group header and add width:max-content to force scroll
# Anchor: the new grouped header we deployed
$anchor = '<div style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:#0A1222'
$newAnchor = '<div id="eia-group-header" style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;width:max-content;background:#0A1222'

if ($h.Contains($anchor) -and -not $h.Contains('id="eia-group-header"')) {
    $h = $h.Replace($anchor, $newAnchor)
    Write-Host "Added id=eia-group-header and width:max-content to group row"
} else {
    Write-Host "Anchor not matched or already has id"
}

# STEP 3: Same for sub-header (23-col row)
$anchor2 = '<div style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:var(--raised)'
$newAnchor2 = '<div id="eia-sub-header" style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;width:max-content;background:var(--raised)'

if ($h.Contains($anchor2) -and -not $h.Contains('id="eia-sub-header"')) {
    $h = $h.Replace($anchor2, $newAnchor2)
    Write-Host "Added id=eia-sub-header and width:max-content to sub-header row"
}

# STEP 4: Ensure eaia-tbody children also get max-content (data rows might inherit container width)
# Look for the style on aspect-register scroll wrapper, ensure overflow-x:auto
# We will leave that alone for now since parent already has overflow:auto

[System.IO.File]::WriteAllText($f, $h, $utf8)

# Verify
$h2 = [System.IO.File]::ReadAllText($f, $utf8)
Write-Host ""
Write-Host "Verification:"
Write-Host "  eia-grouped-header.js refs: $(([regex]::Matches($h2, 'eia-grouped-header\.js')).Count)"
Write-Host "  width:max-content on group: $($h2.IndexOf('id=\"eia-group-header\"') -ge 0 -and $h2.IndexOf('width:max-content') -ge 0)"
Write-Host "  width:max-content count: $(([regex]::Matches($h2, 'width:max-content')).Count)"
Write-Host "  Backup: $f.finalfix2.bak"

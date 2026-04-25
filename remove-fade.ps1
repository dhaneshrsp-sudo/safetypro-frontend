$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\sp-shell.css"
Copy-Item $f "$f.removefade1.bak" -Force
$css = [System.IO.File]::ReadAllText($f, $utf8)

# Remove the ::after gradient rule on the aspect card
# Replace the whole rule block with empty
$old = @"
#aspect-register .card::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(15,23,32,.75));
  pointer-events: none;
  z-index: 5;
}
"@

# Also try variant with different whitespace (might have been minified differently)
if ($css.Contains($old)) {
    $css = $css.Replace($old, "/* fade gradient removed */")
    Write-Host "Removed ::after fade gradient (exact match)"
} else {
    # Fallback: regex match
    $pattern = '#aspect-register\s+\.card::after\s*\{[^}]*\}'
    if ([regex]::IsMatch($css, $pattern)) {
        $css = [regex]::Replace($css, $pattern, '/* fade gradient removed */')
        Write-Host "Removed ::after fade gradient (regex match)"
    } else {
        Write-Host "NOT FOUND - showing context for 'aspect-register .card::after':"
        $idx = $css.IndexOf('::after')
        if ($idx -ge 0) { Write-Host $css.Substring([Math]::Max(0, $idx - 100), 250) }
        return
    }
}

[System.IO.File]::WriteAllText($f, $css, $utf8)
Write-Host "Saved sp-shell.css"

# Bump sp-shell.css version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.removefade1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'sp-shell\.css\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}

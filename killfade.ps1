$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\sp-shell.css"
Copy-Item $f "$f.killfade1.bak" -Force
$css = [System.IO.File]::ReadAllText($f, $utf8)

# Simple substring approach - find start at '#aspect-register .card::after' and end at first closing brace after
$startMarker = '#aspect-register .card::after'
$startIdx = $css.IndexOf($startMarker)
if ($startIdx -lt 0) {
    Write-Host "ABORT: '#aspect-register .card::after' not found"
    return
}
# Find first } after the opening {
$openBrace = $css.IndexOf('{', $startIdx)
$closeBrace = $css.IndexOf('}', $openBrace)
if ($closeBrace -lt 0) {
    Write-Host "ABORT: no closing brace"
    return
}
$blockLen = $closeBrace - $startIdx + 1
Write-Host "Found fade rule at byte $startIdx, length $blockLen chars"

# Remove the block (replace with comment marker)
$css = $css.Substring(0, $startIdx) + "/* fade gradient removed */" + $css.Substring($closeBrace + 1)
[System.IO.File]::WriteAllText($f, $css, $utf8)
Write-Host "Removed fade gradient block"

# Verify removal
$css2 = [System.IO.File]::ReadAllText($f, $utf8)
$stillThere = $css2.IndexOf('#aspect-register .card::after') -ge 0
Write-Host "Gradient rule still present: $stillThere (should be False)"

# Bump sp-shell.css version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.killfade1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, 'sp-shell\.css\?v=(\d+)')
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}

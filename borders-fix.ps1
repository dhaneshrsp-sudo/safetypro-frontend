$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\hira-enhancements.js"
Copy-Item $f "$f.bordersfix1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Replace every <td style="padding:6px 8px;...""> to add border-right if missing
# Pattern: <td style="padding:6px 8px; ...content... ;"> (including possible text-align, color, font-weight)
# Approach: find each literal TD style string and add border-right only if not present

# Strategy: use regex replace on all <td style="padding:6px 8px;[anything]"> 
$pattern = '<td style="padding:6px 8px;([^"]*?)"'
$replaceCount = 0
$js = [regex]::Replace($js, $pattern, {
    param($m)
    $style = $m.Groups[1].Value
    if ($style -like "*border-right*") {
        return $m.Value
    }
    $script:replaceCount++
    return '<td style="padding:6px 8px;' + $style + 'border-right:1px solid var(--border);"'
})

Write-Host "Added border-right to $replaceCount TD tags"
[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Backup: $f.bordersfix1.bak"

# Bump hira-enhancements.js version to bust cache
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.bordersfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$old = 'hira-enhancements.js?v=2'
$new = 'hira-enhancements.js?v=3'
if ($h.Contains($old)) {
    $h = $h.Replace($old, $new)
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped hira-enhancements.js v=2 -> v=3"
}

$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\hira-enhancements.js"
Copy-Item $f "$f.nopencil1.bak" -Force
$js = [System.IO.File]::ReadAllText($f, $utf8)

# Show current pencil line context
$idx = $js.IndexOf('9998;</td>')
if ($idx -lt 0) {
    Write-Host "No pencil pattern found"
    return
}
Write-Host "Pencil at byte $idx"

# Regex replace: find the td with pencil and replace with 3-icon HTML
# Match: <td ...>&#9998;</td>
# Use single quote strings in PS for JS content (no PS quote issues)
$pattern = '<td style="padding:6px 8px;text-align:center;color:var\(--t3\);cursor:pointer;">&#9998;</td>'
$replacement = '<td data-patched="1" style="padding:6px 8px;text-align:center;white-space:nowrap;"><span data-act="view" data-row="'' + i + ''" title="View details" style="margin:0 5px;cursor:pointer;color:#3B82F6;font-size:15px;">&#128065;</span><span data-act="edit" data-row="'' + i + ''" title="Edit hazard" style="margin:0 5px;cursor:pointer;color:#22C55E;font-size:15px;">&#9998;</span><span data-act="photo" data-row="'' + i + ''" title="Attach photo" style="margin:0 5px;cursor:pointer;color:#F59E0B;font-size:15px;">&#128206;</span></td>'

if ($js -match [regex]::Escape($pattern)) {
    $js = [regex]::Replace($js, [regex]::Escape($pattern), $replacement)
    Write-Host "MATCHED and replaced pencil cell with 3-icon HTML"
} else {
    Write-Host "Pattern did NOT match. Showing disk content at pencil:"
    Write-Host $js.Substring([Math]::Max(0, $idx - 150), 170)
    return
}

[System.IO.File]::WriteAllText($f, $js, $utf8)
Write-Host "Saved hira-enhancements.js"

# Bump version v=3 -> v=4
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.nopencil1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
if ($h.Contains('hira-enhancements.js?v=3')) {
    $h = $h.Replace('hira-enhancements.js?v=3', 'hira-enhancements.js?v=4')
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped v=3 -> v=4"
} else {
    Write-Host "v=3 not found - checking actual version"
    $m = [regex]::Match($h, 'hira-enhancements\.js\?v=(\d+)')
    if ($m.Success) {
        Write-Host "Found: hira-enhancements.js?v=$($m.Groups[1].Value)"
    }
}

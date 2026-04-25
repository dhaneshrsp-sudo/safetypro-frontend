$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.externmodal1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove any previous override script
$oldStart = $h.IndexOf('<script id="hira-action-icons-override">')
if ($oldStart -ge 0) {
    $oldEnd = $h.IndexOf('</script>', $oldStart) + 9
    $h = $h.Substring(0, $oldStart) + $h.Substring($oldEnd)
    Write-Host "Removed old inline override script"
}

# Inject external script reference before </body>
$externRef = "<script src=`"hira-action-modal.js?v=1`"></script>"
if ($h.IndexOf('hira-action-modal.js') -lt 0) {
    $bodyClose = $h.LastIndexOf('</body>')
    $h = $h.Substring(0, $bodyClose) + $externRef + "`n" + $h.Substring($bodyClose)
    Write-Host "Added <script src=hira-action-modal.js>"
}

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "HTML updated"

$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.eiaextern1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Inject external script reference before </body>
$externRef = "<script src=`"eia-action-modal.js?v=1`"></script>"
if ($h.IndexOf('eia-action-modal.js') -lt 0) {
    $bodyClose = $h.LastIndexOf('</body>')
    $h = $h.Substring(0, $bodyClose) + $externRef + "`n" + $h.Substring($bodyClose)
    Write-Host "Added <script src=eia-action-modal.js>"
}

# Also update the Sr column format in aspectRenderRegister: '+(i+1)+' -> 'EIA-' + padded
$oldSr = "';color:var(--t3);`">'+(i+1)+'</div>'"
$newSr = "';color:var(--t3);font-weight:600;white-space:nowrap;`">EIA-'+String(i+1).padStart(3,'0')+'</div>'"
if ($h.Contains($oldSr)) {
    $h = $h.Replace($oldSr, $newSr)
    Write-Host "Sr column format: 1,2,3 -> EIA-001, EIA-002..."
}

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Backup: $f.eiaextern1.bak"

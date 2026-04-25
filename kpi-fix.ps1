cd C:\safetypro_complete_frontend
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.kpirow2.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)
$old1 = '.ac-kpi-row { display: grid !important; grid-template-columns: repeat(4,1fr) !important; gap: 12px !important; margin-bottom: 16px !important; }'
$new1 = '.ac-kpi-row { display: grid !important; grid-template-columns: repeat(auto-fit,minmax(115px,1fr)) !important; gap: 10px !important; margin-bottom: 16px !important; }'
$old3 = '.ac-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}'
$new3 = '.ac-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:10px;margin-bottom:18px;}'
$h = $h.Replace($old1, $new1).Replace($old3, $new3)
[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Done - check file"

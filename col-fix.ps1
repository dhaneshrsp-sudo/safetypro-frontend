$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)

$cssFile = "$PWD\sp-shell.css"
Copy-Item $cssFile "$cssFile.colfix1.bak" -Force
$css = [System.IO.File]::ReadAllText($cssFile, $utf8)

if ($css.Contains("/* === EIA column widths fix === */")) {
    Write-Host "Already applied - skipping"
    return
}

# 23 columns. Changes: col 0 (ID) 30->70, col 17 (Gap) 80->120
$append = @"


/* === EIA column widths fix === */
/* Widen ID column (30->70 for EIA-001) and Gap column (80->120 for readable text) */
#eia-group-header,
#eia-sub-header,
#eaia-tbody > div {
  grid-template-columns:
    70px 130px 120px 130px 50px
    30px 30px 30px 30px
    34px 34px 34px 34px 34px 56px 50px
    130px 120px 130px 120px
    56px 50px 100px !important;
}
/* === end EIA column widths fix === */
"@

$css = $css + $append
[System.IO.File]::WriteAllText($cssFile, $css, $utf8)
Write-Host "Widened ID column 30->70 and Gap column 80->120"

# Bump sp-shell.css version
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.colfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$m = [regex]::Match($h, "sp-shell\.css\?v=(\d+)")
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}
Write-Host ""
Write-Host "Backups: sp-shell.css.colfix1.bak, safetypro_risk_management.html.colfix1.bak"

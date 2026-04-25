$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)

$cssFile = "$PWD\sp-shell.css"
Copy-Item $cssFile "$cssFile.idfix1.bak" -Force
$css = [System.IO.File]::ReadAllText($cssFile, $utf8)

if ($css.Contains("/* === EIA ID column fix === */")) {
    Write-Host "Already applied - skipping"
    return
}

$append = @"


/* === EIA ID column fix === */
/* Widen first column to accommodate EIA-001 format - overrides original 30px */
#eia-group-header,
#eia-sub-header,
#eaia-tbody > div {
  grid-template-columns:
    70px 130px 120px 130px 50px
    30px 30px 30px 30px
    34px 34px 34px 34px 34px 56px 50px
    130px 80px 130px 120px
    56px 50px 100px !important;
}
/* === end EIA ID column fix === */
"@

$css = $css + $append
[System.IO.File]::WriteAllText($cssFile, $css, $utf8)
Write-Host "Widened ID column: 30px -> 70px"

# Also update the "#" label in sub-header to "EIA ID" (better UX)
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.idfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)

# Bump sp-shell.css version  
$m = [regex]::Match($h, "sp-shell\.css\?v=(\d+)")
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    [System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}

Write-Host ""
Write-Host "Backups: sp-shell.css.idfix1.bak, safetypro_risk_management.html.idfix1.bak"

$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)

$cssFile = "$PWD\sp-shell.css"
Copy-Item $cssFile "$cssFile.eiafinal1.bak" -Force
$css = [System.IO.File]::ReadAllText($cssFile, $utf8)

if ($css.Contains("/* === EIA table scroll+fit (final) === */")) {
    Write-Host "CSS already locked in sp-shell.css - skipping"
} else {
    $append = @"


/* === EIA table scroll+fit (final) === */
html, body { overflow-y: auto !important; height: auto !important; }
.sp-scope-filters { overflow-x: visible !important; flex-wrap: wrap !important; }
#aspect-register .card {
  overflow-x: auto !important;
  overflow-y: visible !important;
  scrollbar-width: none !important;
  position: relative;
}
#aspect-register .card::-webkit-scrollbar { display: none !important; }
#aspect-register { overflow-x: visible !important; overflow-y: visible !important; }
#rm-aspect { overflow-x: visible !important; overflow-y: visible !important; }
#eaia-tbody, #eia-group-header, #eia-flat-header {
  width: max-content !important;
  min-width: 100% !important;
}
#aspect-register .card::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(15,23,32,.8));
  pointer-events: none;
  z-index: 5;
}
/* === end EIA table scroll+fit === */
"@
    $css = $css + $append
    [System.IO.File]::WriteAllText($cssFile, $css, $utf8)
    Write-Host "Appended EIA scroll+fit CSS to sp-shell.css"
}

# Also remove duplicate eia-grouped-header.js reference (causes duplicate row)
$htmlFile = "$PWD\safetypro_risk_management.html"
Copy-Item $htmlFile "$htmlFile.eiafinal1.bak" -Force
$h = [System.IO.File]::ReadAllText($htmlFile, $utf8)
$pattern = '<script src="eia-grouped-header\.js\?v=\d+"></script>\s*'
$removed = ([regex]::Matches($h, $pattern)).Count
$h = [regex]::Replace($h, $pattern, "")
Write-Host "Removed $removed eia-grouped-header.js ref(s)"

# Bump sp-shell.css cache-buster version in HTML
$m = [regex]::Match($h, "sp-shell\.css\?v=(\d+)")
if ($m.Success) {
    $oldV = [int]$m.Groups[1].Value
    $newV = $oldV + 1
    $h = $h.Replace("sp-shell.css?v=$oldV", "sp-shell.css?v=$newV")
    Write-Host "Bumped sp-shell.css v=$oldV -> v=$newV"
}

[System.IO.File]::WriteAllText($htmlFile, $h, $utf8)
Write-Host ""
Write-Host "DONE. Backups:"
Write-Host "  $cssFile.eiafinal1.bak"
Write-Host "  $htmlFile.eiafinal1.bak"
